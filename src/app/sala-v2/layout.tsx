import type { Metadata, Viewport } from "next";

// Rota de testes: não deve aparecer em buscadores.
export const metadata: Metadata = {
  title: "S.P.E.A.K — Sala v2 (testes)",
  robots: { index: false, follow: false },
};

// Mesmo viewport da /sala: no mobile, o teclado virtual redimensiona o layout
// (e o 100dvh), mantendo a barra de mensagem visível acima dele.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function SalaV2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
