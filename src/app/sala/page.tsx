"use client";

import { CameraPanel } from "@/components/room/camera-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { MicPanel } from "@/components/room/mic-panel";
import { RoomHeader } from "@/components/room/room-header";

export default function SalaPage() {
  return (
    <div className="flex h-screen flex-col">
      <RoomHeader />

      <main className="grid flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 overflow-y-auto p-4 md:grid-rows-[auto_minmax(0,1fr)] md:grid-cols-2 md:overflow-hidden">
        <CameraPanel />
        <MicPanel />

        <div className="flex min-h-0 flex-col md:col-span-2">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
