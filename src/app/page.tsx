import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="w-full px-6 py-6 sm:px-10">
        <span className="text-2xl font-bold tracking-tight">Speak</span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Conversas sem barreiras
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance sm:text-xl">
          Speak é uma plataforma que traduz Libras e fala em tempo real,
          permitindo conversas fluidas entre pessoas surdas e ouvintes no
          mesmo espaço.
        </p>
        <Link
          href="/sala"
          className={cn(buttonVariants({ size: "lg" }), "mt-10 h-12 px-8 text-base")}
        >
          Entrar na sala
        </Link>
      </main>

      <footer className="w-full px-6 py-6 text-center text-sm text-muted-foreground sm:px-10">
        Projeto desenvolvido para hackathon Oracle
      </footer>
    </div>
  );
}
