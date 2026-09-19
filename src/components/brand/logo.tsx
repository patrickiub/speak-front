import Image from "next/image";

import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { px: 24, text: "text-lg" },
  default: { px: 32, text: "text-2xl" },
  lg: { px: 48, text: "text-3xl" },
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function Logo({ size = "default", className }: LogoProps) {
  const { px, text } = SIZE_MAP[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logo.png" alt="Logo Speak" width={px} height={px} />
      <span className={cn("font-serif font-normal tracking-[-0.02em]", text)}>
        s.p.e.a.k
      </span>
    </div>
  );
}
