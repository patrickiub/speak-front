"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { MessageSource } from "@/lib/types";
import { useRoomStore } from "@/store/useRoomStore";

// Mensagens lidas em voz alta: o que a câmera reconheceu da pessoa surda.
const AUTO_SPEAK_SOURCES: MessageSource[] = ["libras"];
const STORAGE_KEY = "speak:v2:auto-speak";

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

const noopSubscribe = () => () => {};

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const ptBR = voices.filter((voice) => /^pt[-_]BR$/i.test(voice.lang));
  const pt = ptBR.length ? ptBR : voices.filter((voice) => /^pt\b/i.test(voice.lang));
  // Prefere as vozes online (Google/Microsoft Natural), que soam melhor.
  return pt.find((voice) => !voice.localService) ?? pt[0] ?? null;
}

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Lê em voz alta as mensagens novas vindas da Libras (síntese de voz do
 * navegador). Para não gerar eco, nunca fala com o microfone ligado: espera
 * ele desligar e, se o microfone ligar no meio de uma fala, corta e repete
 * a mensagem depois.
 */
export function useAutoSpeak() {
  const messages = useRoomStore((state) => state.messages);
  const isListening = useRoomStore((state) => state.isListening);

  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => getSynth() !== null,
    () => false
  );
  // A sala só renderiza no cliente (RoomPageV2 espera o useIsMobile), então
  // ler o localStorage no inicializador não causa erro de hidratação.
  const [enabled, setEnabled] = useState(readEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const queueRef = useRef<string[]>([]);
  const currentRef = useRef<{
    text: string;
    utterance: SpeechSynthesisUtterance;
  } | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const enabledRef = useRef(enabled);
  const listeningRef = useRef(isListening);
  const seenIdsRef = useRef<Set<string> | null>(null);
  const pumpRef = useRef<() => void>(() => {});

  const pump = useCallback(() => {
    const synth = getSynth();
    if (!synth || !enabledRef.current || listeningRef.current || currentRef.current) return;
    const text = queueRef.current.shift();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    if (voiceRef.current) utterance.voice = voiceRef.current;

    const finish = () => {
      // Fala cancelada (interrupt) também cai aqui; só avança a fila se esta
      // ainda for a fala atual.
      if (currentRef.current?.utterance === utterance) {
        currentRef.current = null;
        pumpRef.current();
      }
      setIsSpeaking(currentRef.current !== null);
    };
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = finish;
    utterance.onerror = finish;

    currentRef.current = { text, utterance };
    synth.speak(utterance);
  }, []);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  /** Interrompe a fala atual; com requeue, ela volta para o início da fila. */
  const interrupt = useCallback((requeue: boolean) => {
    const current = currentRef.current;
    currentRef.current = null;
    if (current && requeue) queueRef.current.unshift(current.text);
    getSynth()?.cancel();
  }, []);

  // Suporte, voz pt-BR (a lista de vozes carrega assíncrona) e preferência salva.
  useEffect(() => {
    const synth = getSynth();
    if (!synth) return;

    const loadVoice = () => {
      voiceRef.current = pickVoice(synth);
    };
    loadVoice();
    synth.addEventListener("voiceschanged", loadVoice);
    return () => {
      synth.removeEventListener("voiceschanged", loadVoice);
      currentRef.current = null;
      queueRef.current = [];
      synth.cancel();
    };
  }, []);

  // Microfone ligou → corta a fala (volta para a fila). Desligou → continua.
  useEffect(() => {
    listeningRef.current = isListening;
    if (isListening) interrupt(true);
    else pump();
  }, [isListening, interrupt, pump]);

  // Enfileira só mensagens novas: o que já estava na conversa ao montar é ignorado.
  useEffect(() => {
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(messages.map((message) => message.id));
      return;
    }
    const ids = new Set(messages.map((message) => message.id));
    // Conversa limpa → descarta o que ainda não foi falado.
    if (messages.length === 0 && seenIdsRef.current.size > 0) {
      queueRef.current = [];
      interrupt(false);
    }
    for (const message of messages) {
      if (seenIdsRef.current.has(message.id)) continue;
      if (AUTO_SPEAK_SOURCES.includes(message.source) && enabledRef.current) {
        queueRef.current.push(message.content);
      }
    }
    seenIdsRef.current = ids;
    pump();
  }, [messages, interrupt, pump]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Sem storage (aba anônima etc.): a preferência só vale nesta visita.
    }
    if (!next) {
      queueRef.current = [];
      interrupt(false);
      setIsSpeaking(false);
    }
  }, [interrupt]);

  return { isSupported, enabled, isSpeaking, toggle };
}
