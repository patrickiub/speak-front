"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CameraOff,
  Hand,
  MessageCircle,
  Mic,
  Send,
  Square,
  Trash2,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { MobileNotice } from "@/components/mobile-notice";
import { MessageBubble } from "@/components/room/message-bubble";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrasCapture } from "@/hooks/useLibrasCapture";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

const PILL =
  "flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-md";
const ROUND_OVERLAY_BUTTON =
  "flex size-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform active:scale-95 disabled:opacity-50";

export function MobileRoom() {
  const clearMessages = useRoomStore((state) => state.clearMessages);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <MobileNotice />

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/60 px-3 backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Limpar conversa"
            title="Limpar conversa"
            onClick={clearMessages}
          >
            <Trash2 />
          </Button>
        </div>
      </header>

      <MobileCamera />
      <MobileConversation />
    </div>
  );
}

function MobileCamera() {
  const isCameraOn = useRoomStore((state) => state.isCameraOn);
  const setCameraOn = useRoomStore((state) => state.setCameraOn);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { status, handsDetected, lastError, startManual, stopManual } =
    useLibrasCapture(videoRef, isCameraOn);

  useEffect(() => {
    streamRef.current = stream;
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Erro ao dar play no vídeo:", err);
      });
    }
  }, [stream]);

  // Ao desmontar (ex.: girar para desktop), libera a câmera.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setCameraOn(false);
    };
  }, [setCameraOn]);

  async function handleStart() {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch {
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }

  function handleStop() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraOn(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return (
    <section aria-label="Câmera — Libras" className="min-h-0 flex-1 px-2 pt-2 pb-1">
      <div
        className={cn(
          "relative size-full overflow-hidden rounded-2xl",
          isCameraOn ? "bg-slate-900" : "bg-gradient-to-br from-secondary to-muted"
        )}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn("size-full object-cover", !isCameraOn && "hidden")}
        />

        {!isCameraOn && (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-card shadow-sm">
              <Hand className="size-7 text-muted-foreground" />
            </div>
            <Button size="lg" className="h-11 gap-2 px-6 text-base" onClick={handleStart}>
              <Camera />
              Iniciar câmera
            </Button>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}

        {isCameraOn && (
          <>
            <div className="absolute inset-x-2 top-2 flex flex-col items-start gap-1.5">
              <CaptureStatusPill status={status} handsDetected={handsDetected} />
              {lastError && (
                <p className={cn(PILL, "max-w-full text-destructive")}>
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span className="truncate">{lastError}</span>
                </p>
              )}
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <button
                type="button"
                aria-label={
                  status === "capturing" ? "Parar captura manual" : "Capturar sinal (manual)"
                }
                title={status === "capturing" ? "Parar captura" : "Capturar sinal"}
                onClick={status === "capturing" ? stopManual : startManual}
                disabled={status === "analyzing"}
                className={ROUND_OVERLAY_BUTTON}
              >
                {status === "capturing" ? (
                  <Square className="size-4 fill-current" />
                ) : (
                  <Hand className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="Desligar câmera"
                title="Desligar câmera"
                onClick={handleStop}
                className={ROUND_OVERLAY_BUTTON}
              >
                <CameraOff className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CaptureStatusPill({
  status,
  handsDetected,
}: {
  status: ReturnType<typeof useLibrasCapture>["status"];
  handsDetected: boolean;
}) {
  if (status === "analyzing") {
    return (
      <div className={PILL}>
        <span className="size-2 animate-pulse rounded-full bg-primary" />
        Analisando...
      </div>
    );
  }
  if (status === "capturing") {
    return (
      <div className={PILL}>
        <span className="size-2 animate-pulse rounded-full bg-teal-500" />
        Capturando sinal...
      </div>
    );
  }
  return (
    <div className={cn(PILL, !handsDetected && "text-muted-foreground")}>
      <span
        className={cn(
          "size-2 rounded-full",
          handsDetected ? "bg-teal-500" : "bg-muted-foreground/50"
        )}
      />
      {handsDetected ? "Mãos detectadas" : "Mostre as mãos"}
    </div>
  );
}

function MobileConversation() {
  const messages = useRoomStore((state) => state.messages);
  const addMessage = useRoomStore((state) => state.addMessage);
  const setListening = useRoomStore((state) => state.setListening);

  const { isSupported, isListening, interimText, error, start, stop } =
    useSpeechRecognition();

  const [draft, setDraft] = useState("");
  const [barHeight, setBarHeight] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const wasListeningRef = useRef(false);

  // Mesmo comportamento do MicPanel: sincroniza o store e, ao parar de ouvir,
  // envia a transcrição como mensagem de fala.
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

  // Mede a barra fixa para reservar o mesmo espaço no fim da lista.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() => setBarHeight(bar.offsetHeight));
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll rolando só o container (scrollIntoView poderia mover a página).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, barHeight]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;

    addMessage({ source: "text", content });
    setDraft("");
  }

  const micError = !isSupported
    ? "Voz não suportada neste navegador. Use Chrome ou Edge."
    : error;

  return (
    <section aria-label="Conversa" className="relative min-h-0 flex-1">
      <div
        ref={listRef}
        className="flex h-full flex-col overflow-y-auto overscroll-contain px-3 pt-2"
        style={{ paddingBottom: barHeight + 8 }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
            <MessageCircle className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
            <p className="max-w-[16rem] text-xs text-muted-foreground">
              Ligue a câmera para traduzir Libras ou toque no microfone para
              falar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {isListening && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-3 flex justify-center"
          style={{ bottom: barHeight + 8 }}
        >
          <p className="line-clamp-2 max-w-full rounded-2xl border border-border bg-card/90 px-3 py-1.5 text-sm italic text-muted-foreground shadow-md backdrop-blur-md">
            {interimText || "Ouvindo..."}
          </p>
        </div>
      )}

      <div
        ref={barRef}
        className="absolute inset-x-0 bottom-0 border-t border-border bg-background/80 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      >
        {micError && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] leading-tight text-destructive">
            <AlertCircle className="size-3 shrink-0" />
            <span className="line-clamp-1">{micError}</span>
          </p>
        )}

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <div className="relative flex size-11 shrink-0 items-center justify-center">
            {isListening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-75" />
                <span className="absolute inset-1 animate-ping rounded-full bg-destructive opacity-50 [animation-delay:0.5s]" />
              </>
            )}
            <button
              type="button"
              disabled={!isSupported}
              aria-label={isListening ? "Parar de falar" : "Toque para falar"}
              aria-pressed={isListening}
              onClick={() => {
                if (isListening) {
                  stop();
                } else {
                  start();
                }
              }}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-full text-primary-foreground shadow-md transition-all duration-200 active:scale-95",
                !isSupported && "cursor-not-allowed bg-muted text-muted-foreground shadow-none",
                isSupported && !isListening && "bg-primary",
                isSupported && isListening && "bg-destructive"
              )}
            >
              <Mic className="size-5" />
            </button>
          </div>

          <Input
            placeholder="Digite uma mensagem..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            enterKeyHint="send"
            className="h-11 flex-1 rounded-full px-4"
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Enviar mensagem"
            disabled={!draft.trim()}
            className="size-11 shrink-0 rounded-full"
          >
            <Send />
          </Button>
        </form>
      </div>
    </section>
  );
}
