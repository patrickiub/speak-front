"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimText: string;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    setIsSupported(getSpeechRecognitionConstructor() !== null);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor || recognitionRef.current) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    finalTranscriptRef.current = "";
    setInterimText("");

    recognition.onresult = (event) => {
      let interim = "";
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      finalTranscriptRef.current = final;
      setInterimText((final + interim).trim());
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
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, interimText, start, stop };
}
