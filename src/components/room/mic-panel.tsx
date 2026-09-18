"use client";

import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useRoomStore } from "@/store/useRoomStore";

export function MicPanel() {
  const addMessage = useRoomStore((state) => state.addMessage);
  const setListening = useRoomStore((state) => state.setListening);
  const { isSupported, isListening, interimText, start, stop } =
    useSpeechRecognition();
  const wasListeningRef = useRef(false);

  useEffect(() => {
    setListening(isListening);
  }, [isListening, setListening]);

  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      const content = interimText.trim();
      if (content) {
        addMessage({ source: "speech", content, confidence: 0.95 });
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, interimText, addMessage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Microfone — Fala</CardTitle>
        <p className="text-sm text-muted-foreground">
          Segure o botão para falar
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <button
          type="button"
          disabled={!isSupported}
          aria-label="Segurar para falar"
          onMouseDown={start}
          onMouseUp={stop}
          onMouseLeave={() => {
            if (isListening) stop();
          }}
          onTouchStart={(event) => {
            event.preventDefault();
            start();
          }}
          onTouchEnd={(event) => {
            event.preventDefault();
            stop();
          }}
          className={cn(
            "flex size-32 items-center justify-center rounded-full text-white transition-colors",
            !isSupported && "cursor-not-allowed bg-muted text-muted-foreground",
            isSupported && !isListening && "bg-blue-600 hover:bg-blue-500",
            isSupported && isListening && "animate-pulse bg-red-600"
          )}
        >
          <Mic className="size-10" />
        </button>

        <p className="min-h-5 max-w-xs text-center text-sm text-muted-foreground">
          {interimText || (isListening ? "Ouvindo..." : "")}
        </p>

        {!isSupported && (
          <p className="text-center text-sm text-destructive">
            Reconhecimento de voz não suportado neste navegador. Use Chrome ou
            Edge.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
