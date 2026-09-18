"use client";

import { Camera } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

export function RoomHeader() {
  const isCameraOn = useRoomStore((state) => state.isCameraOn);
  const clearMessages = useRoomStore((state) => state.clearMessages);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-4 backdrop-blur-md">
      <Logo size="sm" />

      <div className="flex items-center gap-2">
        <div
          role="status"
          title={isCameraOn ? "Câmera ligada" : "Câmera desligada"}
          aria-label={isCameraOn ? "Câmera ligada" : "Câmera desligada"}
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-full",
            isCameraOn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Camera className="size-4" />
          {isCameraOn && (
            <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-primary ring-2 ring-background" />
          )}
        </div>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="sm"
          className="h-auto py-1.5"
          onClick={clearMessages}
        >
          <span className="flex flex-col text-xs leading-tight">
            <span>Limpar</span>
            <span>Conversa</span>
          </span>
        </Button>
      </div>
    </header>
  );
}
