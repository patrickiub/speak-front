"use client";

import type { RefObject } from "react";
import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

import { VLIBRAS_PLAYER_URL, type PlayerStatus } from "./use-vlibras-player";

export const PLAYER_STATUS_LABEL: Record<PlayerStatus, string> = {
  loading: "Carregando avatar...",
  idle: "Aguardando fala",
  translating: "Traduzindo...",
  playing: "Sinalizando",
  error: "Avatar indisponível neste navegador",
};

type AvatarStageProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  status: PlayerStatus;
  progress: number;
  className?: string;
};

/** Iframe do player VLibras + tela de carregamento. Ocupa o pai inteiro. */
export function AvatarStage({ iframeRef, status, progress, className }: AvatarStageProps) {
  return (
    <div className={cn("relative size-full", className)}>
      <iframe
        ref={iframeRef}
        src={VLIBRAS_PLAYER_URL}
        title="Avatar VLibras"
        className={cn(
          "size-full border-0 transition-opacity",
          status === "loading" ? "opacity-0" : "opacity-100"
        )}
      />

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-card shadow-sm">
            <UserRound className="size-8 animate-pulse text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">Carregando avatar...</span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-card">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
