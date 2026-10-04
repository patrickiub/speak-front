import type { Viewport } from "next";

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
