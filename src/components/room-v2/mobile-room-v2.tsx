"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Mic, RotateCcw, Send, Trash2, Volume2, VolumeX } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { MobileNotice } from "@/components/mobile-notice";
import { SOURCE_CONFIG } from "@/components/room/message-bubble";
import { MobileCamera } from "@/components/room/mobile-room";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

import { AvatarStage, PLAYER_STATUS_LABEL } from "./avatar-stage";
import { EnvBadge } from "./env-badge";
import { useAutoSpeak } from "./use-auto-speak";
import { useAutoTranslate } from "./use-auto-translate";
import { useSpeechRecognitionV2 } from "./use-speech-recognition-v2";
import { useVLibrasPlayer, type PlayerStatus } from "./use-vlibras-player";

// Mesmo estilo das pílulas sobre a câmera da v1 (MobileCamera).
const PILL =
  "flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-md";

const ROUND_BUTTON =
  "flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform active:scale-95 disabled:opacity-40";

/**
 * Mobile da /sala-v2, estilo live com convidado: câmera em cima, avatar
 * embaixo, e a conversa flutuando sobre a metade de baixo.
 *
 *  ┌──────────────┐
 *  │ header       │
 *  │ câmera       │  50%
 *  ├──────────────┤
 *  │ avatar       │
 *  │ ┊mensagens   │  50% (mensagens em overlay, com degradê)
 *  │ (🎤)[...](➤) │
 *  └──────────────┘
 */
export function MobileRoomV2() {
  const clearMessages = useRoomStore((state) => state.clearMessages);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <MobileNotice />

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

      <MobileCamera />
      <AvatarLive />
    </div>
  );
}

function AvatarLive() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { status, progress, lastGloss, translate, repeat } = useVLibrasPlayer(iframeRef);
  useAutoTranslate(translate);
  const speech = useAutoSpeak();

  return (
    <section aria-label="Avatar e conversa" className="min-h-0 flex-1 px-2 pt-1 pb-2">
      <div className="relative size-full overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-muted">
        <AvatarStage
          iframeRef={iframeRef}
          status={status}
          progress={progress}
          className="absolute inset-0"
        />

        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <AvatarStatusPill status={status} />
          <div className="flex items-center gap-2">
            {speech.isSupported && (
              <button
                type="button"
                aria-label={
                  speech.enabled
                    ? "Desligar voz das mensagens em Libras"
                    : "Ligar voz das mensagens em Libras"
                }
                title={
                  speech.enabled
                    ? "Desligar voz das mensagens em Libras"
                    : "Ligar voz das mensagens em Libras"
                }
                aria-pressed={speech.enabled}
                onClick={speech.toggle}
                className={ROUND_BUTTON}
              >
                {speech.enabled ? (
                  <Volume2
                    className={cn("size-4", speech.isSpeaking && "animate-pulse text-primary")}
                  />
                ) : (
                  <VolumeX className="size-4" />
                )}
              </button>
            )}
            <button
              type="button"
              aria-label="Repetir última tradução"
              title="Repetir última tradução"
              onClick={repeat}
              disabled={!lastGloss || status !== "idle"}
              className={ROUND_BUTTON}
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>

        <LiveConversation dimmed={status === "playing"} />
      </div>
    </section>
  );
}

function AvatarStatusPill({ status }: { status: PlayerStatus }) {
  const isActive = status === "translating" || status === "playing";
  return (
    <div
      aria-live="polite"
      className={cn(PILL, status === "error" ? "text-destructive" : "text-muted-foreground")}
    >
      {status === "error" ? (
        <AlertCircle className="size-3.5 shrink-0" />
      ) : (
        <span
          className={cn(
            "size-2 rounded-full",
            isActive ? "animate-pulse bg-primary" : "bg-muted-foreground/50"
          )}
        />
      )}
      {PLAYER_STATUS_LABEL[status]}
    </div>
  );
}

/**
 * Comentários estilo live + barra de mensagem, sobre o avatar.
 * Ocupa só a parte de baixo do avatar e some em degradê para cima; enquanto o
 * avatar sinaliza, fica mais transparente para não esconder as mãos.
 */
function LiveConversation({ dimmed }: { dimmed: boolean }) {
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
    <div className="pointer-events-none absolute inset-x-0 top-[45%] bottom-0 flex flex-col">
      <div
        ref={listRef}
        className={cn(
          "pointer-events-auto min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 transition-opacity duration-300 [scrollbar-width:none]",
          "[mask-image:linear-gradient(to_bottom,transparent,black_40%)]",
          dimmed && "opacity-75"
        )}
      >
        <div className="flex min-h-full flex-col justify-end gap-1.5 pt-8 pb-1.5">
          {messages.map((message) => (
            <LiveComment key={message.id} message={message} />
          ))}
          {isListening && (
            <p className="w-fit max-w-[85%] rounded-2xl bg-black/45 px-3 py-1.5 text-sm italic text-white/80 backdrop-blur-sm">
              {interimText || "Ouvindo..."}
            </p>
          )}
        </div>
      </div>

      <div className="pointer-events-auto px-2 pb-2">
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
        "w-fit max-w-[85%] animate-in fade-in slide-in-from-bottom-2 rounded-2xl px-3 py-1.5 text-sm leading-snug shadow-sm backdrop-blur-sm duration-300",
        message.source === "speech"
          ? "bg-primary text-primary-foreground"
          : "bg-black/65 text-white"
      )}
    >
      <span className="mr-1.5 inline-flex items-center gap-1 align-[-1px] text-[11px] font-semibold opacity-80">
        <Icon className="size-3" />
        {config.label}
      </span>
      {message.content}
    </div>
  );
}
