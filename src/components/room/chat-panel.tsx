"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/room/message-bubble";
import { useRoomStore } from "@/store/useRoomStore";

export function ChatPanel() {
  const messages = useRoomStore((state) => state.messages);
  const addMessage = useRoomStore((state) => state.addMessage);
  const [draft, setDraft] = useState("");
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;

    addMessage({ source: "text", content });
    setDraft("");
  }

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>Conversa</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex min-h-64 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-border p-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Ligue a câmera para começar a traduzir
              Libras ou segure o microfone para falar.
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={scrollEndRef} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Plano B: digite uma mensagem..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={!draft.trim()}>
              <Send />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
