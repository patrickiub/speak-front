"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";

/**
 * Cópia do hooks/useSpeechRecognition com a correção de texto duplicado no
 * Chrome Android (a v1 fica intacta). Diferença: o texto é remontado a partir
 * de TODOS os resultados a cada evento, em vez de acumular a partir de
 * event.resultIndex. No Android, com continuous = true, o resultIndex repete
 * e os resultados finais vêm cumulativos ("oi" e depois "oi tudo bem"), o que
 * fazia trechos entrarem duas vezes.
 */

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimText: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

// Compara por palavras inteiras, sem caixa nem pontuação ("Oi." == "oi").
const words = (text: string) =>
  text
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);

const startsWithWords = (whole: string[], part: string[]) =>
  part.length <= whole.length && part.every((word, i) => whole[i] === word);

const endsWithWords = (whole: string[], part: string[]) =>
  startsWithWords(whole.slice(whole.length - part.length), part);

/** Junta um trecho novo ao anterior, descartando a repetição cumulativa. */
function mergeSegment(segments: string[], next: string) {
  const prev = segments[segments.length - 1];
  if (prev !== undefined) {
    const prevWords = words(prev);
    const nextWords = words(next);
    // Android: o trecho novo já contém o anterior inteiro → substitui.
    if (startsWithWords(nextWords, prevWords)) {
      segments[segments.length - 1] = next;
      return;
    }
    // Trecho repetido que já está no fim do texto → ignora.
    if (endsWithWords(prevWords, nextWords)) return;
  }
  segments.push(next);
}

export function buildTranscript(results: SpeechRecognitionResultList): string {
  const segments: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const text = results[i][0]?.transcript.trim();
    if (text) mergeSegment(segments, text);
  }
  return segments.join(" ");
}

export function useSpeechRecognitionV2(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => getSpeechRecognitionConstructor() !== null,
    () => false
  );
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor || recognitionRef.current) return;

    setError(null);

    // Alguns navegadores mobile só concedem permissão de microfone se
    // getUserMedia for chamado explicitamente antes do SpeechRecognition.
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((primeStream) => {
        primeStream.getTracks().forEach((track) => track.stop());

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "pt-BR";
        recognition.continuous = true;
        recognition.interimResults = true;

        setInterimText("");

        recognition.onresult = (event) => {
          setInterimText(buildTranscript(event.results));
        };

        recognition.onerror = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      })
      .catch((err) => {
        console.error("Permissão de microfone negada:", err);
        setError("Permissão de microfone negada. Verifique as configurações do navegador.");
      });
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, interimText, error, start, stop };
}
