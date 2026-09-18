"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Mic, MicOff } from "lucide-react";

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
    <Card className="flex min-h-[220px] flex-col overflow-hidden border-border shadow-sm md:min-h-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-medium">
          <Mic className="size-4 text-primary" />
          Microfone — Fala
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 md:min-h-0 md:flex-1">
        <div className="relative flex size-24 items-center justify-center">
          {isListening && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-75" />
              <span className="absolute inset-2 animate-ping rounded-full bg-destructive opacity-50 [animation-delay:0.5s]" />
            </>
          )}
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
              "relative flex size-24 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105",
              !isSupported &&
                "cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:scale-100",
              isSupported && !isListening && "bg-primary",
              isSupported && isListening && "bg-destructive"
            )}
          >
            <Mic className="size-8" />
          </button>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {isListening ? (
            <MicOff className="size-3.5" />
          ) : (
            <Mic className="size-3.5" />
          )}
          {isListening ? "Toque para parar" : "Toque para começar"}
        </p>

        <div className="min-h-[3rem] w-full max-w-xs rounded-lg bg-secondary/50 px-4 py-2 text-center text-base italic text-muted-foreground">
          {interimText || (isListening ? "Ouvindo..." : "")}
        </div>

        {!isSupported && (
          <p className="flex items-center gap-1.5 text-center text-sm text-destructive">
            <AlertCircle className="size-3.5" />
            Reconhecimento de voz não suportado neste navegador. Use Chrome ou
            Edge.
          </p>
        )}

        {isSupported && error && (
          <p className="flex items-center gap-1.5 text-center text-sm text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
