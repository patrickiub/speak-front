import Link from "next/link";
import { ArrowRight, Hand, MessageCircle, Mic } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Hand,
    title: "Câmera captura Libras",
    description: "Sinais são traduzidos automaticamente em tempo real.",
  },
  {
    icon: Mic,
    title: "Microfone captura fala",
    description: "A fala é transcrita instantaneamente com IA.",
  },
  {
    icon: MessageCircle,
    title: "Chat unifica tudo",
    description: "Libras e fala aparecem juntas em uma conversa só.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-background to-secondary/30">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          ✨ Hackathon Oracle 2026
        </div>

        <h1 className="max-w-3xl text-balance font-serif text-6xl tracking-tight md:text-7xl">
          Conversas <span className="text-primary italic">sem barreiras</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Speak conecta pessoas surdas e ouvintes em tempo real, traduzindo
          Libras e fala com IA.
        </p>

        <Link
          href="/sala"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-10 h-12 gap-2 px-8 text-base"
          )}
        >
          Entrar na sala
          <ArrowRight className="size-4" />
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Sem cadastro • Funciona no navegador • Grátis
        </p>
      </main>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <step.icon className="size-5 text-primary" />
            </div>
            <p className="font-medium">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </section>

      <footer className="w-full px-6 py-6 text-center text-xs text-muted-foreground">
        Feito com cuidado para acessibilidade
      </footer>
    </div>
  );
}
