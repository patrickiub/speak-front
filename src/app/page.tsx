import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hand, MessageCircle, Mic } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { MobileNotice } from "@/components/mobile-notice";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Hand,
    title: "Libras em texto",
    description: "A câmera capta os sinais e a IA os converte em texto.",
  },
  {
    icon: Mic,
    title: "Fala em legenda",
    description: "A IA transcreve a voz do profissional em tempo real.",
  },
  {
    icon: MessageCircle,
    title: "IA como ponte",
    description: "Não substitui o psicólogo: amplia a autonomia do paciente.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-background to-secondary/30">
      <MobileNotice />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:shrink-0 md:py-4">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-col items-center justify-center px-6 py-12 text-center md:py-10">
        <div className="mb-6 animate-in fade-in zoom-in-95 duration-700 dark:rounded-full dark:bg-white/90 dark:p-1.5 dark:shadow-lg dark:shadow-primary/20">
          <Image
            src="/logo.png"
            alt="S.P.E.A.K"
            width={80}
            height={80}
            priority
            className="size-14 md:size-20"
          />
        </div>

        <div className="mb-6 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground md:mb-4">
          <span className="font-semibold text-primary">S.P.E.A.K</span> · Sign
          Platform for Empathy, Access &amp; Knowledge
        </div>

        <h1 className="max-w-3xl text-balance font-serif text-6xl tracking-tight md:text-6xl">
          Seja <span className="text-primary italic">compreendido</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:mt-4">
          O S.P.E.A.K traduz Libras e fala em tempo real para que pessoas
          surdas façam terapia com autonomia e privacidade.
        </p>

        <Link
          href="/sala"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-10 h-12 gap-2 px-8 text-base md:mt-6"
          )}
        >
          Experimente o S.P.E.A.K
          <ArrowRight className="size-4" />
        </Link>

        <p className="mt-4 text-xs text-muted-foreground md:mt-3">
          Sem cadastro • Direto no navegador
        </p>
      </main>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm md:gap-2 md:p-4"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary md:size-10">
              <step.icon className="size-5 text-primary" />
            </div>
            <p className="font-medium">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-2xl text-balance px-6 pt-12 pb-8 text-center font-serif text-xl text-muted-foreground md:pt-10 md:text-2xl">
        O direito de ser ouvido começa pelo direito de ser compreendido.
      </p>

      <footer className="mt-auto w-full px-6 py-6 text-center text-xs text-muted-foreground">
        <p>A IA não substitui a conexão humana. Ela a potencializa.</p>
        <p className="mt-1 text-[11px] opacity-80">
          Tech4Change 2026 · Grupo 01 · MVP — não substitui psicólogos nem
          intérpretes de Libras.
        </p>
      </footer>
    </div>
  );
}
