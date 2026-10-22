"use client";

import { RotateCw, Smartphone } from "lucide-react";

import { useMediaQuery } from "@/hooks/useIsMobile";

/** Celular deitado: tela de toque com pouca altura em paisagem. */
export const LANDSCAPE_PHONE_QUERY =
  "(orientation: landscape) and (pointer: coarse) and (max-height: 500px)";

export function useIsLandscapePhone(): boolean | null {
  return useMediaQuery(LANDSCAPE_PHONE_QUERY);
}

/** Cobre a sala pedindo para girar o celular. Some ao voltar para retrato. */
export function RotateNotice() {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background p-6 text-center"
    >
      <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Smartphone className="size-9" />
        <RotateCw className="absolute -top-1 -right-1 size-6 rounded-full bg-background p-0.5" />
      </div>
      <p className="text-lg font-semibold">Gire o celular para a vertical</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        A sala foi feita para ser usada com o celular em pé.
      </p>
    </div>
  );
}
