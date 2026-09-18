import { create } from 'zustand';

import type { Message } from '@/lib/types';

interface RoomState {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isCameraOn: boolean;
  setCameraOn: (on: boolean) => void;
  isListening: boolean;
  setListening: (on: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  isCameraOn: false,
  setCameraOn: (on) => set({ isCameraOn: on }),
  isListening: false,
  setListening: (on) => set({ isListening: on }),
}));
