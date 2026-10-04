"use client";

import { useEffect, useState } from "react";
import { Monitor, X } from "lucide-react";

import { MOBILE_QUERY, useMediaQuery } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "speak-mobile-notice-dismissed";

// Tela pequena OU dispositivo de toque com tela estreita (ex.: tablet em retrato).
const NOTICE_QUERY = `${MOBILE_QUERY}, (pointer: coarse) and (max-width: 1024px)`;

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function MobileNotice({ className }: { className?: string }) {
  const isSmallOrTouch = useMediaQuery(NOTICE_QUERY);
  const [dismissed, setDismissed] = useState(true);

  // sessionStorage só existe no client: lê depois de montar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(readDismissed());
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage bloqueado (modo privado etc.): só esconde nesta renderização.
    }
  }

  if (!isSmallOrTouch || dismissed) return null;

  return (
    <div
      role="note"
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-300",
        className
      )}
    >
      <Monitor className="size-3.5 shrink-0 text-primary" />
      <p className="flex-1 leading-snug">
        Para a melhor experiência, use um computador com Chrome ou Edge.
      </p>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={handleDismiss}
        className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-background/60 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
