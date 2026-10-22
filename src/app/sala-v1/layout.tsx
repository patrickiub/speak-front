import type { Metadata, Viewport } from "next";

// Fallback da sala antiga (sem VLibras): só pela URL direta, fora dos buscadores.
export const metadata: Metadata = {
  title: "S.P.E.A.K — Sala v1",
  robots: { index: false, follow: false },
};

// Mesmo viewport da /sala: no mobile, o teclado virtual redimensiona o layout
// (e o 100dvh), mantendo a barra de mensagem visível acima dele.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function SalaV1Layout({ children }: { children: React.ReactNode }) {
  return children;
}
