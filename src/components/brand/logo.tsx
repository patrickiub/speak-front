import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { square: "size-6", text: "text-lg" },
  default: { square: "size-8", text: "text-2xl" },
  lg: { square: "size-10", text: "text-3xl" },
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function Logo({ size = "default", className }: LogoProps) {
  const { square, text } = SIZE_MAP[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* LOGO PLACEHOLDER: substituir div abaixo por <Image src="/logo.svg" ... /> quando disponível */}
      <div className={cn("rounded-lg bg-gradient-to-br from-primary to-accent", square)} />
      <span className={cn("font-serif font-normal tracking-[-0.02em]", text)}>
        Speak
      </span>
    </div>
  );
}
