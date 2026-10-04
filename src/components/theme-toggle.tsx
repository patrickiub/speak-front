"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const WRAPPER =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-1 outline-none";
const ICON = "hidden size-4 shrink-0 transition-colors duration-300 sm:block";
const TRACK = "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300";
const THUMB =
  "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-md transition-transform duration-300";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Placeholder com a mesma largura do switch para não "pular" o layout.
  if (!mounted) {
    return (
      <div className={WRAPPER} aria-hidden>
        <Sun className={cn(ICON, "text-muted-foreground/40")} />
        <span className={cn(TRACK, "bg-muted")} />
        <Moon className={cn(ICON, "text-muted-foreground/40")} />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Alternar tema claro/escuro"
      title={isDark ? "Modo escuro" : "Modo claro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        WRAPPER,
        "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <Sun
        className={cn(ICON, isDark ? "text-muted-foreground/50" : "text-yellow-400")}
      />
      <span className={cn(TRACK, isDark ? "bg-[#22C3F5]" : "bg-yellow-400")}>
        <span className={cn(THUMB, isDark ? "translate-x-5" : "translate-x-0")} />
      </span>
      <Moon
        className={cn(ICON, isDark ? "text-[#22C3F5]" : "text-muted-foreground/50")}
      />
    </button>
  );
}
