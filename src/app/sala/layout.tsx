import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "S.P.E.A.K — Sala",
};

// No mobile, o teclado virtual redimensiona o layout (e o 100dvh), mantendo
// a barra de mensagem visível acima dele.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function SalaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
