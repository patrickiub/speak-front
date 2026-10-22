import { cn } from "@/lib/utils";

/** Selo "BETA" ao lado do título do avatar (integração VLibras em testes). */
export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      title="Integração com VLibras em fase de testes"
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-red-500/50 bg-red-500/10 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wider text-red-600 uppercase dark:text-red-400",
        className
      )}
    >
      Beta
    </span>
  );
}
