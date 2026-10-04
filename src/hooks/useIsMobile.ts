"use client";

import { useCallback, useSyncExternalStore } from "react";

export const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Observa uma media query no client. Retorna `null` no servidor e durante a
 * hidratação (evita hydration mismatch); depois, o valor real e atualizado.
 */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null
  );
}

/** `true` em telas < md (768px). `null` antes de montar no client. */
export function useIsMobile(): boolean | null {
  return useMediaQuery(MOBILE_QUERY);
}
