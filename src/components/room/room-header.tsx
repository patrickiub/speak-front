"use client";

import { Camera } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

export function RoomHeader() {
  const isCameraOn = useRoomStore((state) => state.isCameraOn);
  const clearMessages = useRoomStore((state) => state.clearMessages);

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <span className="text-xl font-bold tracking-tight">Speak</span>

      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className={cn(
            "gap-1.5",
            isCameraOn
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Camera className="size-3.5" />
          {isCameraOn ? "Câmera ligada" : "Câmera desligada"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={clearMessages}>
          Limpar conversa
        </Button>
      </div>
    </header>
  );
}
