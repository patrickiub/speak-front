import { AlertCircle, Hand, Mic, Type } from "lucide-react";

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
    bubbleClass: "bg-secondary text-secondary-foreground rounded-3xl rounded-bl-lg",
  },
  speech: {
    label: "Fala",
    icon: Mic,
    align: "right",
    bubbleClass: "bg-primary text-primary-foreground rounded-3xl rounded-br-lg",
  },
  text: {
    label: "Texto",
    icon: Type,
    align: "right",
    bubbleClass: "bg-muted text-foreground rounded-3xl rounded-br-lg",
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
    message.source === "speech" &&
    typeof message.confidence === "number" &&
    message.confidence < 0.8;

  const alternatives =
    message.source === "libras" && message.top3 && message.top3.length > 1
      ? message.top3.slice(1).map((t) => t.label)
      : [];

  return (
    <div
      className={cn(
        "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300",
        config.align === "right" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "relative flex max-w-[80%] flex-col gap-1 px-4 py-2.5",
          config.bubbleClass
        )}
      >
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium opacity-70">
          <Icon className="size-3" />
          {config.label}
          {lowConfidence && (
            <span title="Confiança baixa na tradução">
              <AlertCircle className="size-3.5" />
            </span>
          )}
        </div>
        <p className="text-base leading-relaxed">{message.content}</p>
        {alternatives.length > 0 && (
          <p
            className="text-xs opacity-60"
            title={`Outras possibilidades: ${alternatives.join(", ")}`}
          >
            alternativas: {alternatives.join(", ")}
          </p>
        )}
      </div>
      <span className="mt-1 text-xs text-muted-foreground/60">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
