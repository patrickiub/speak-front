"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

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
    <Card className="flex flex-1 flex-col border-border shadow-sm md:min-h-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-medium">
          <MessageCircle className="size-4 text-primary" />
          Conversa
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border border-border p-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                <MessageCircle className="size-7 text-muted-foreground" />
              </div>
              <p className="text-base font-medium">Nenhuma mensagem ainda</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Ligue a câmera para começar a traduzir Libras ou segure o
                microfone para falar.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={scrollEndRef} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Textarea
            placeholder="Digite uma mensagem..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            className="rounded-xl border-border focus-visible:ring-primary/50"
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={!draft.trim()}>
              Enviar
              <Send />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
