import { AlertCircle, Hand, Mic, Type } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Message, MessageSource } from "@/lib/types";

const SOURCE_CONFIG: Record<
  MessageSource,
  {
    label: string;
    icon: typeof Hand;
    align: "left" | "right";
    bubbleClass: string;
  }
> = {
  libras: {
    label: "Libras",
    icon: Hand,
    align: "left",
    bubbleClass: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
  },
  speech: {
    label: "Fala",
    icon: Mic,
    align: "right",
    bubbleClass: "bg-blue-600 text-white",
  },
  text: {
    label: "Texto",
    icon: Type,
    align: "right",
    bubbleClass: "bg-slate-700 text-white",
  },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: { message: Message }) {
  const config = SOURCE_CONFIG[message.source];
  const Icon = config.icon;
  const lowConfidence =
    typeof message.confidence === "number" && message.confidence < 0.8;

  return (
    <div
      className={cn(
        "flex flex-col",
        config.align === "right" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "relative flex max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2 text-sm",
          config.bubbleClass
        )}
      >
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="gap-1">
            <Icon className="size-3" />
            {config.label}
          </Badge>
          {lowConfidence && (
            <span title="Confiança baixa — verifique se o texto está correto">
              <AlertCircle className="size-3.5 text-amber-500" />
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      <span className="mt-1 text-xs text-slate-500">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
