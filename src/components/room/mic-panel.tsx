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
  const { isSupported, isListening, interimText, error, start, stop } =
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
    <Card className="flex min-h-[220px] flex-col overflow-hidden md:min-h-0">
      <CardHeader>
        <CardTitle>Microfone — Fala</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 md:min-h-0 md:flex-1">
        <button
          type="button"
          disabled={!isSupported}
          aria-label={isListening ? "Parar de falar" : "Toque para falar"}
          onClick={() => {
            if (isListening) {
              stop();
            } else {
              start();
            }
          }}
          className={cn(
            "flex size-24 shrink-0 items-center justify-center rounded-full text-white transition-colors",
            !isSupported && "cursor-not-allowed bg-muted text-muted-foreground",
            isSupported && !isListening && "bg-blue-600 hover:bg-blue-500",
            isSupported && isListening && "animate-pulse bg-red-600"
          )}
        >
          <Mic className="size-8" />
        </button>

        <p className="text-sm text-muted-foreground">
          {isListening ? "Toque para parar" : "Toque para começar"}
        </p>

        <p className="min-h-5 max-w-xs text-center text-sm text-muted-foreground">
          {interimText || (isListening ? "Ouvindo..." : "")}
        </p>

        {!isSupported && (
          <p className="text-center text-sm text-destructive">
            Reconhecimento de voz não suportado neste navegador. Use Chrome ou
            Edge.
          </p>
        )}

        {isSupported && error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
