"use client";

import { useRef } from "react";
import { AlertCircle, RotateCcw, UserRound, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AvatarStage, PLAYER_STATUS_LABEL } from "./avatar-stage";
import { BetaBadge } from "./beta-badge";
import { LiveConversation, PILL, ROUND_BUTTON } from "./mobile-overlays";
import { useAutoSpeak } from "./use-auto-speak";
import { useAutoTranslate } from "./use-auto-translate";
import { useVLibrasPlayer, type PlayerStatus } from "./use-vlibras-player";

type RoomAvatarProps = {
  /** Mobile: de ponta a ponta, controles sobrepostos e conversa por cima. */
  mobile: boolean;
  className?: string;
};

/**
 * Avatar VLibras que sinaliza as falas da conversa, nos dois layouts.
 *
 * O <iframe> do player fica sempre na mesma posição da árvore: trocar de
 * layout (girar, redimensionar) só muda classes e os controles em volta, sem
 * recarregar o avatar. Por isso Card/CardContent são usados também no mobile
 * (sem a moldura) e o que é de um layout só entra depois do palco.
 */
export function RoomAvatar({ mobile, className }: RoomAvatarProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { status, progress, lastGloss, translate, repeat } = useVLibrasPlayer(iframeRef);
  useAutoTranslate(translate);
  const speech = useAutoSpeak();

  const canRepeat = Boolean(lastGloss) && status === "idle";
  const speechLabel = speech.enabled
    ? "Desligar voz das mensagens em Libras"
    : "Ligar voz das mensagens em Libras";
  const speechIcon = speech.enabled ? (
    <Volume2 className={cn(mobile && "size-4", speech.isSpeaking && "animate-pulse text-primary")} />
  ) : (
    <VolumeX className={cn(mobile && "size-4")} />
  );

  return (
    <Card
      role="region"
      aria-label="Avatar — Libras"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden",
        mobile
          ? "gap-0 rounded-none bg-transparent py-0 ring-0"
          : "border-border shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {!mobile && (
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base font-medium">
            <UserRound className="size-4 text-primary" />
            Avatar — Libras
            <BetaBadge className="ml-1" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">Traduz as falas automaticamente</p>
        </CardHeader>
      )}

      <CardContent className={cn("flex min-h-0 flex-1 flex-col", mobile ? "px-0" : "gap-3")}>
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-secondary to-muted",
            !mobile && "rounded-lg"
          )}
        >
          <AvatarStage
            iframeRef={iframeRef}
            status={status}
            progress={progress}
            className="absolute inset-0"
          />

          {mobile && (
            <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className={cn(PILL, "py-0.5 text-[11px] font-semibold")}>
                  <UserRound className="size-3 text-primary" />
                  Avatar — Libras
                  <BetaBadge className="text-[9px]" />
                </p>
                <StatusLabel status={status} className={PILL} />
              </div>
              <div className="flex items-center gap-2">
                {speech.isSupported && (
                  <button
                    type="button"
                    aria-label={speechLabel}
                    title={speechLabel}
                    aria-pressed={speech.enabled}
                    onClick={speech.toggle}
                    className={ROUND_BUTTON}
                  >
                    {speechIcon}
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Repetir última tradução"
                  title="Repetir última tradução"
                  onClick={repeat}
                  disabled={!canRepeat}
                  className={ROUND_BUTTON}
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
            </div>
          )}

          {mobile && <LiveConversation dimmed={status === "playing"} />}
        </div>

        {!mobile && (
          <div className="flex items-center justify-between gap-2">
            <StatusLabel status={status} className="min-w-0 text-xs" />

            <div className="flex shrink-0 items-center gap-1">
              {speech.isSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={speech.toggle}
                  aria-pressed={speech.enabled}
                  title={speechLabel}
                >
                  {speechIcon}
                  Voz
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={repeat}
                disabled={!canRepeat}
                title="Repetir última tradução"
              >
                <RotateCcw />
                Repetir
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusLabel({ status, className }: { status: PlayerStatus; className?: string }) {
  const isActive = status === "translating" || status === "playing";
  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5",
        status === "error" ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {status === "error" ? (
        <AlertCircle className="size-3.5 shrink-0" />
      ) : (
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            isActive ? "animate-pulse bg-primary" : "bg-muted-foreground/50"
          )}
        />
      )}
      <span className="truncate">{PLAYER_STATUS_LABEL[status]}</span>
    </p>
  );
}
