"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Maximize, Mic, Minimize, Send, Trash2 } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SOURCE_CONFIG } from "@/components/room/message-bubble";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

import { EnvBadge } from "./env-badge";
import { useFullscreen } from "./use-fullscreen";
import { useSpeechRecognitionV2 } from "./use-speech-recognition-v2";

/*
 * Peças do layout mobile da /sala (estilo live): header compacto, botão de
 * tela cheia e a conversa flutuando sobre o avatar. Câmera e avatar ficam em
 * RoomCamera/RoomAvatar, que servem aos dois layouts.
 */

// Mesmo estilo das pílulas sobre a câmera (MobileCamera).
export const PILL =
  "flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-md";

export const ROUND_BUTTON =
  "flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40";

export function MobileRoomHeader() {
  const clearMessages = useRoomStore((state) => state.clearMessages);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/60 px-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <Logo size="sm" />
        <EnvBadge />
      </div>
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
  );
}

/** Tela cheia estilo player. Some onde a página não pode ir para tela cheia (iPhone). */
export function FullscreenButton() {
  const { isSupported, isFullscreen, toggle } = useFullscreen();
  if (!isSupported) return null;

  const label = isFullscreen ? "Sair da tela cheia" : "Tela cheia";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isFullscreen}
      onClick={toggle}
      className={ROUND_BUTTON}
    >
      {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
    </button>
  );
}

/**
 * Comentários estilo live + barra de mensagem, sobre o avatar.
 * Ocupa a parte de baixo do avatar e some em degradê para cima; enquanto o
 * avatar sinaliza, fica mais transparente para não esconder as mãos.
 */
export function LiveConversation({ dimmed }: { dimmed: boolean }) {
  const messages = useRoomStore((state) => state.messages);
  const addMessage = useRoomStore((state) => state.addMessage);
  const setListening = useRoomStore((state) => state.setListening);

  const { isSupported, isListening, interimText, error, start, stop } = useSpeechRecognitionV2();

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const wasListeningRef = useRef(false);

  // Mesmo comportamento da v1: sincroniza o store e, ao parar de ouvir,
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

  // Auto-scroll rolando só a lista (scrollIntoView poderia mover a página).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, isListening, interimText]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;
    addMessage({ source: "text", content });
    setDraft("");
  }

  const micError = !isSupported ? "Voz não suportada neste navegador. Use Chrome ou Edge." : error;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[40%] bottom-0 flex flex-col">
      <div
        ref={listRef}
        className={cn(
          "pointer-events-auto min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 transition-opacity duration-300 [scrollbar-width:none]",
          "[mask-image:linear-gradient(to_bottom,transparent,black_40%)]",
          dimmed && "opacity-75"
        )}
      >
        <div className="flex min-h-full flex-col justify-end gap-1 pt-8 pb-1">
          {messages.map((message) => (
            <LiveComment key={message.id} message={message} />
          ))}
          {isListening && (
            <p className="w-fit max-w-[92%] rounded-2xl bg-black/45 px-2.5 py-1 text-sm leading-snug italic text-white/80 backdrop-blur-sm">
              {interimText || "Ouvindo..."}
            </p>
          )}
        </div>
      </div>

      <div className="pointer-events-auto px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {micError && (
          <p className="mb-1.5 flex w-fit items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[11px] leading-tight text-destructive backdrop-blur-md">
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
              onClick={() => (isListening ? stop() : start())}
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
            className="h-11 flex-1 rounded-full border-white/20 bg-background/75 px-4 shadow-md backdrop-blur-md"
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Enviar mensagem"
            disabled={!draft.trim()}
            className="size-11 shrink-0 rounded-full shadow-md"
          >
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}

/** Mensagem compacta estilo comentário de live. */
function LiveComment({ message }: { message: Message }) {
  const config = SOURCE_CONFIG[message.source];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "w-fit max-w-[92%] animate-in fade-in slide-in-from-bottom-2 rounded-2xl px-2.5 py-1 text-sm leading-snug shadow-sm backdrop-blur-sm duration-300",
        message.source === "speech"
          ? "bg-primary text-primary-foreground"
          : "bg-black/65 text-white"
      )}
    >
      <span className="mr-1 inline-flex items-center gap-1 align-[-1px] text-[11px] font-semibold opacity-80">
        <Icon className="size-3" />
        {config.label}
      </span>
      {message.content}
    </div>
  );
}
