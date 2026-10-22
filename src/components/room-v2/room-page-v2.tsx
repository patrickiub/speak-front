"use client";

import { MobileNotice } from "@/components/mobile-notice";
import { ChatPanel } from "@/components/room/chat-panel";
import { MicPanel } from "@/components/room/mic-panel";
import { RoomHeader } from "@/components/room/room-header";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

import { EnvBadge } from "./env-badge";
import { FullscreenButton, MobileRoomHeader } from "./mobile-overlays";
import { RoomAvatar } from "./room-avatar";
import { RoomCamera } from "./room-camera";
import { RotateNotice, useIsLandscapePhone } from "./rotate-notice";

/**
 * Sala principal (/sala). Uma árvore só para desktop e mobile: câmera e
 * avatar ficam sempre nas mesmas posições e só mudam de classe. Assim,
 * redimensionar ou girar a tela adapta o layout sem recarregar o avatar
 * VLibras nem desligar a câmera.
 *
 * Desktop: câmera e avatar lado a lado, microfone embaixo, conversa à direita.
 *
 *  ┌──────── 50% ────────┬──── 30% ────┬─ 20% ─┐
 *  │ câmera              │ avatar      │       │ 80%
 *  ├─────────────────────┴─────────────┤ chat  │
 *  │ microfone                         │       │ 20%
 *  └───────────────────────────────────┴───────┘
 *
 * Mobile (estilo live): câmera em cima, avatar embaixo, conversa por cima do
 * avatar. Tudo de ponta a ponta.
 *
 *  ┌──────────────┐
 *  │ header       │
 *  │ câmera    [⛶]│  42%
 *  ├──────────────┤
 *  │ avatar       │
 *  │ ┊mensagens   │  58% (mensagens em overlay, com degradê)
 *  │ (🎤)[...](➤) │
 *  └──────────────┘
 */
export function RoomPageV2() {
  const isSmallScreen = useIsMobile();
  const isLandscapePhone = useIsLandscapePhone();

  // Espera o client saber o tamanho da tela (evita hydration mismatch e
  // montar a câmera/o player duas vezes).
  if (isSmallScreen === null || isLandscapePhone === null) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  // Celular deitado fica largo como desktop: mantém o layout mobile e cobre
  // com o aviso para girar.
  const mobile = isSmallScreen || isLandscapePhone;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <MobileNotice />
      {mobile ? <MobileRoomHeader /> : <RoomHeader badge={<EnvBadge />} />}

      <main
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden",
          mobile
            ? "grid-cols-1 grid-rows-[minmax(0,42fr)_minmax(0,58fr)]"
            : // Chat com no mínimo 16rem para não espremer em telas ~1024px.
              "grid-cols-[minmax(0,50fr)_minmax(0,30fr)_minmax(16rem,20fr)] grid-rows-[minmax(0,80fr)_minmax(0,20fr)] gap-4 p-4"
        )}
      >
        <RoomCamera
          mobile={mobile}
          topRight={<FullscreenButton />}
          className="col-start-1 row-start-1"
        />
        <RoomAvatar
          mobile={mobile}
          className={mobile ? "col-start-1 row-start-2" : "col-start-2 row-start-1"}
        />

        {!mobile && (
          <div className="col-span-2 col-start-1 row-start-2 grid min-h-0 grid-rows-[minmax(0,1fr)]">
            <MicPanel />
          </div>
        )}
        {!mobile && (
          <div className="col-start-3 row-span-2 row-start-1 flex min-h-0 flex-col">
            <ChatPanel />
          </div>
        )}
      </main>

      {isLandscapePhone && <RotateNotice />}
    </div>
  );
}
