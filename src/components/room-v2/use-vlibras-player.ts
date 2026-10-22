"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/*
 * Ponte com o player do VLibras (avatar Unity) embutido num <iframe>.
 *
 * Não existe API pública para "traduzir este texto" no widget. Isto replica o
 * que o próprio VLibras Widget 7.x faz por dentro (vlibras.gov.br/app):
 * 1. o player roda em <iframe src=".../app/unity/index.html">;
 * 2. o texto vai para a API de tradução, que devolve a glosa (ex.: "BOM DIA");
 * 3. a glosa vai para o iframe por postMessage({ type: "unity", ... });
 * 4. o iframe responde com postMessage({ type: "unity_event", ... }).
 *
 * Como é interno ao VLibras, pode mudar numa atualização deles. Se o avatar
 * parar de sinalizar, comparar com https://vlibras.gov.br/app/vlibras-plugin.js
 * e o chunk "vlibras-initial-*.js" que ele carrega.
 */

const VLIBRAS_ORIGIN = "https://vlibras.gov.br";
// Versão usada pelo widget na data da integração (cache-busting do Unity).
export const VLIBRAS_PLAYER_URL = `${VLIBRAS_ORIGIN}/app/unity/index.html?v=7.12.2`;
const TRANSLATE_URL = "https://traducao2.vlibras.gov.br/translate";
const DICTIONARY_URL = "https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/";

const TRANSLATE_TIMEOUT_MS = 10_000;
// Destrava a fila se o player nunca avisar que terminou.
const PLAY_TIMEOUT_MS = 60_000;
// Velocidade dos sinais (multiplicador do player; 1 = normal, o widget oferece
// 0.5 a 2.5). 20% mais lento que o padrão para facilitar a leitura.
const PLAYER_SPEED = 0.8;

export type VLibrasAvatar = "icaro" | "hosana" | "guga";

export type PlayerStatus =
  | "loading" // baixando o player Unity
  | "idle" // pronto, sem nada na fila
  | "translating" // aguardando a API de tradução
  | "playing" // avatar sinalizando
  | "error";

type UnityEvent = { type: "unity_event"; event: string; data?: unknown };

function isUnityEvent(data: unknown): data is UnityEvent {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === "unity_event"
  );
}

/** Texto → glosa. Em caso de falha, o widget usa o texto em maiúsculas. */
async function translateToGloss(text: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const response = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Tradução falhou: ${response.status}`);

    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw) as { traducao?: string };
      if (parsed.traducao) return parsed.traducao;
    } catch {
      // Resposta em texto puro (formato atual).
    }
    return raw;
  } catch (error) {
    console.warn("[VLibras] tradução indisponível, usando o texto:", error);
    return text.toUpperCase();
  } finally {
    clearTimeout(timeout);
  }
}

export function useVLibrasPlayer(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  avatar: VLibrasAvatar = "icaro"
) {
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [lastGloss, setLastGloss] = useState<string | null>(null);

  const isReadyRef = useRef(false);
  const isBusyRef = useRef(false);
  const hasStartedRef = useRef(false);
  const queueRef = useRef<string[]>([]);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processNextRef = useRef<() => void>(() => {});

  const send = useCallback(
    (object: string, method: string, params?: string | number) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "unity", object, method, params },
        VLIBRAS_ORIGIN
      );
    },
    [iframeRef]
  );

  const finishCurrent = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    playTimeoutRef.current = null;
    isBusyRef.current = false;
    hasStartedRef.current = false;
    processNextRef.current();
  }, []);

  // Processa a fila em ordem: uma fala por vez, sem cortar a anterior.
  useEffect(() => {
    processNextRef.current = async () => {
      if (!isReadyRef.current || isBusyRef.current) return;

      const text = queueRef.current.shift();
      if (!text) {
        setStatus("idle");
        return;
      }

      isBusyRef.current = true;
      setStatus("translating");
      const gloss = await translateToGloss(text);

      setLastGloss(gloss);
      setStatus("playing");
      send("PlayerManager", "playNow", gloss);
      playTimeoutRef.current = setTimeout(finishCurrent, PLAY_TIMEOUT_MS);
    };
  }, [send, finishCurrent]);

  useEffect(() => {
    let setupTimer: ReturnType<typeof setTimeout> | undefined;

    function onMessage(event: MessageEvent) {
      if (event.origin !== VLIBRAS_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isUnityEvent(event.data)) return;

      const { event: name, data } = event.data;

      if (name === "update_progress") {
        const value = Number(data);
        if (!Number.isNaN(value)) setProgress(Math.round(value * 100));
      }

      if (name === "on_error") setStatus("error");

      if (name === "on_load_player") {
        // Mesma sequência do widget ao carregar o player.
        send("PlayerManager", "setBaseUrl", DICTIONARY_URL);
        send("PlayerManager", "setSlider", PLAYER_SPEED);
        setupTimer = setTimeout(() => {
          send("PlayerManager", "Change", avatar);
          send("PlayerManager", "setSubtitlesState", 1);
          isReadyRef.current = true;
          setStatus("idle");
          processNextRef.current();
        }, 500);
      }

      if (name === "on_playing_state_change" && Array.isArray(data)) {
        // [isPlaying, isPaused, isPlayingIntervalAnimation, isLoading, isRepeatable]
        const [isPlaying, , , isLoading] = data.map((value) => value === "True");
        if (!isBusyRef.current) return;
        if (isPlaying) hasStartedRef.current = true;
        else if (!isLoading && hasStartedRef.current) finishCurrent();
      }
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (setupTimer) clearTimeout(setupTimer);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, [iframeRef, send, avatar, finishCurrent]);

  /** Adiciona um texto à fila de tradução. */
  const translate = useCallback((text: string) => {
    const content = text.trim();
    if (!content) return;
    queueRef.current.push(content);
    processNextRef.current();
  }, []);

  /** Repete a última glosa sinalizada. */
  const repeat = useCallback(() => {
    if (!lastGloss || isBusyRef.current || !isReadyRef.current) return;
    isBusyRef.current = true;
    setStatus("playing");
    send("PlayerManager", "playNow", lastGloss);
    playTimeoutRef.current = setTimeout(finishCurrent, PLAY_TIMEOUT_MS);
  }, [lastGloss, send, finishCurrent]);

  return { status, progress, lastGloss, translate, repeat };
}
