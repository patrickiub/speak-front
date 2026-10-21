"use client";

import { MobileNotice } from "@/components/mobile-notice";
import { CameraPanel } from "@/components/room/camera-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { MicPanel } from "@/components/room/mic-panel";
import { RoomHeader } from "@/components/room/room-header";
import { useIsMobile } from "@/hooks/useIsMobile";

import { AvatarPanel } from "./avatar-panel";
import { EnvBadge } from "./env-badge";
import { MobileRoomV2 } from "./mobile-room-v2";

/**
 * Sala de testes. Reusa os painéis da /sala com layout próprio. Desktop:
 * câmera (pessoa surda) e avatar lado a lado, como "duas pessoas";
 * microfone embaixo dos dois e conversa numa coluna estreita à direita.
 *
 *  ┌──────── 50% ────────┬──── 30% ────┬─ 20% ─┐
 *  │ câmera              │ avatar      │       │ 80%
 *  ├─────────────────────┴─────────────┤ chat  │
 *  │ microfone                         │       │ 20%
 *  └───────────────────────────────────┴───────┘
 */
export function RoomPageV2() {
  const isMobile = useIsMobile();

  // Renderiza só um layout por vez: montar os dois duplicaria câmera,
  // getUserMedia, MediaPipe e o player Unity do avatar.
  if (isMobile === null) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  // Mobile: estilo live (câmera em cima, avatar embaixo, conversa em overlay).
  if (isMobile) {
    return <MobileRoomV2 />;
  }

  return (
    <div className="flex h-screen flex-col">
      <MobileNotice />
      <RoomHeader badge={<EnvBadge />} />

      {/* Chat com no mínimo 16rem para não espremer em telas ~1024px. */}
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,50fr)_minmax(0,30fr)_minmax(16rem,20fr)] grid-rows-[minmax(0,80fr)_minmax(0,20fr)] gap-4 overflow-hidden p-4">
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)]">
          <CameraPanel />
        </div>

        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)]">
          <AvatarPanel />
        </div>

        <div className="col-span-2 grid min-h-0 grid-rows-[minmax(0,1fr)]">
          <MicPanel />
        </div>

        <div className="col-start-3 row-span-2 row-start-1 flex min-h-0 flex-col">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
