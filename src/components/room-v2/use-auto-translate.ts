"use client";

import { useEffect, useRef } from "react";

import type { MessageSource } from "@/lib/types";
import { useRoomStore } from "@/store/useRoomStore";

// Mensagens que o avatar traduz sozinho. A fala do ouvinte vira Libras para
// a pessoa surda; adicionar "text" para traduzir também o que for digitado.
const AUTO_TRANSLATE_SOURCES: MessageSource[] = ["speech"];

/** Manda para o avatar cada mensagem nova da conversa (fala, por padrão). */
export function useAutoTranslate(translate: (text: string) => void) {
  const messages = useRoomStore((state) => state.messages);
  // Só traduz mensagens novas: o que já estava na conversa ao montar é ignorado.
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(messages.map((message) => message.id));
      return;
    }
    for (const message of messages) {
      if (seenIdsRef.current.has(message.id)) continue;
      seenIdsRef.current.add(message.id);
      if (AUTO_TRANSLATE_SOURCES.includes(message.source)) {
        translate(message.content);
      }
    }
  }, [messages, translate]);
}
