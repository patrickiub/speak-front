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
      <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 md:min-h-0 md:flex-1 md:flex-row md:flex-wrap md:justify-center md:gap-6 md:py-2">
        <div className="relative flex size-24 shrink-0 items-center justify-center md:size-20">
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
              "relative flex size-24 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 md:size-20",
              !isSupported &&
                "cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:scale-100",
              isSupported && !isListening && "bg-primary",
              isSupported && isListening && "bg-destructive"
            )}
          >
            <Mic className="size-8 md:size-7" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 md:min-w-0 md:flex-1 md:items-start md:justify-center md:gap-1.5">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground md:text-xs">
            {isListening ? (
              <MicOff className="size-3.5" />
            ) : (
              <Mic className="size-3.5" />
            )}
            {isListening ? "Toque para parar" : "Toque para começar"}
          </p>

          <div className="min-h-[3rem] w-full max-w-xs overflow-hidden rounded-lg bg-secondary/50 px-4 py-2 text-center text-base italic text-muted-foreground md:min-h-0 md:max-w-none md:line-clamp-2 md:py-1.5 md:text-left md:text-sm">
            {interimText || (isListening ? "Ouvindo..." : "")}
          </div>
        </div>

        {!isSupported && (
          <p className="flex items-center gap-1.5 text-center text-sm text-destructive md:basis-full">
            <AlertCircle className="size-3.5" />
            Reconhecimento de voz não suportado neste navegador. Use Chrome ou
            Edge.
          </p>
        )}

        {isSupported && error && (
          <p className="flex items-center gap-1.5 text-center text-sm text-destructive md:basis-full">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
