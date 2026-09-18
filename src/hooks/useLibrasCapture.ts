"use client";

import { useEffect, useRef, useState } from "react";

import { recognizeLibras } from "@/lib/api";
import { useRoomStore } from "@/store/useRoomStore";

const CLIP_DURATION_MS = 2000;

function pickMimeType(): string {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/webm")) {
    return "video/webm";
  }
  return "video/webm;codecs=vp8";
}

export function useLibrasCapture(stream: MediaStream | null) {
  const [isProcessing, setIsProcessing] = useState(false);
  const addMessage = useRoomStore((state) => state.addMessage);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!stream) return;

    stoppedRef.current = false;
    const mimeType = pickMimeType();

    function recordClip() {
      if (stoppedRef.current || !stream) return;

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        setIsProcessing(true);
        try {
          const response = await recognizeLibras(blob);
          addMessage({
            source: "libras",
            content: response.text,
            confidence: response.confidence,
            tokens: response.tokens,
          });
        } finally {
          setIsProcessing(false);
        }
        if (!stoppedRef.current) recordClip();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, CLIP_DURATION_MS);
    }

    recordClip();

    return () => {
      stoppedRef.current = true;
    };
  }, [stream, addMessage]);

  return { isProcessing };
}
