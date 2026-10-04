"use client";

import { MobileNotice } from "@/components/mobile-notice";
import { CameraPanel } from "@/components/room/camera-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { MicPanel } from "@/components/room/mic-panel";
import { MobileRoom } from "@/components/room/mobile-room";
import { RoomHeader } from "@/components/room/room-header";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function SalaPage() {
  const isMobile = useIsMobile();

  // Renderiza só um layout por vez: montar os dois (escondendo um via CSS)
  // duplicaria câmera, getUserMedia e MediaPipe.
  if (isMobile === null) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  if (isMobile) {
    return <MobileRoom />;
  }

  return (
    <div className="flex min-h-screen flex-col md:h-screen">
      <MobileNotice />
      <RoomHeader />

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 md:min-h-0 md:grid-cols-[55fr_45fr] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
        <div className="grid grid-rows-[auto_auto] gap-4 md:min-h-0 md:grid-rows-[80fr_20fr]">
          <CameraPanel />
          <MicPanel />
        </div>

        <div className="flex min-h-[500px] flex-col md:min-h-0">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
