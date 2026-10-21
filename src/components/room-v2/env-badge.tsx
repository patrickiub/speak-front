"use client";

import { Badge } from "@/components/ui/badge";

/** Indicador discreto de que a página é a versão de testes (/sala-v2). */
export function EnvBadge() {
  return (
    <Badge
      variant="outline"
      title="Versão de testes da sala"
      className="text-[10px] text-muted-foreground"
    >
      v2 · testes
    </Badge>
  );
}
