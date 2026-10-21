"use client";

import { useRef } from "react";
import { AlertCircle, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AvatarStage, PLAYER_STATUS_LABEL } from "./avatar-stage";
import { useAutoTranslate } from "./use-auto-translate";
import { useVLibrasPlayer } from "./use-vlibras-player";

/** Avatar VLibras que sinaliza as falas da conversa (desktop da /sala-v2). */
export function AvatarPanel() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { status, progress, lastGloss, translate, repeat } =
    useVLibrasPlayer(iframeRef);
  useAutoTranslate(translate);

  const isActive = status === "translating" || status === "playing";

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-medium">
          <UserRound className="size-4 text-primary" />
          Avatar — Libras
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Traduz as falas automaticamente
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-gradient-to-br from-secondary to-muted">
          <AvatarStage iframeRef={iframeRef} status={status} progress={progress} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            aria-live="polite"
            className={cn(
              "flex min-w-0 items-center gap-1.5 text-xs",
              status === "error" ? "text-destructive" : "text-muted-foreground"
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

          <Button
            variant="ghost"
            size="sm"
            onClick={repeat}
            disabled={!lastGloss || status !== "idle"}
            title="Repetir última tradução"
          >
            <RotateCcw />
            Repetir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
