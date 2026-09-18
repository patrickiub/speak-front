"use client";

import { CameraPanel } from "@/components/room/camera-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { MicPanel } from "@/components/room/mic-panel";
import { RoomHeader } from "@/components/room/room-header";

export default function SalaPage() {
  return (
    <div className="flex h-screen flex-col">
      <RoomHeader />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-[2fr_1fr] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
        <div className="grid min-h-0 grid-rows-[auto_auto] gap-4 md:grid-rows-[65fr_35fr]">
          <CameraPanel />
          <MicPanel />
        </div>

        <div className="flex min-h-[400px] flex-col md:min-h-0">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
