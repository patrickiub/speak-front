"use client";

import { cn } from "@/lib/utils";

/** Pílula com a versão da sala, ao lado do logo. */
export function EnvBadge({ className }: { className?: string }) {
  return (
    <span
      title="Versão 2 da sala"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-sm leading-5 font-semibold text-primary",
        className
      )}
    >
      v2
    </span>
  );
}
