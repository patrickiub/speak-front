"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLibrasCapture } from "@/hooks/useLibrasCapture";
import { useRoomStore } from "@/store/useRoomStore";

export function CameraPanel() {
  const isCameraOn = useRoomStore((state) => state.isCameraOn);
  const setCameraOn = useRoomStore((state) => state.setCameraOn);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { isProcessing } = useLibrasCapture(stream);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Erro ao dar play no vídeo:", err);
      });
    }
  }, [stream]);

  async function handleStart() {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch {
      setError(
        "Não foi possível acessar a câmera. Verifique as permissões do navegador."
      );
    }
  }

  function handleStop() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraOn(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return (
    <Card className="flex flex-col md:min-h-0">
      <CardHeader>
        <CardTitle>Câmera — Libras</CardTitle>
        <p className="text-sm text-muted-foreground">
          Faça sinais para tradução automática
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden rounded-lg md:aspect-auto md:min-h-0 md:flex-1",
            isCameraOn ? "bg-slate-900" : "bg-muted"
          )}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={cn("h-full w-full object-cover", !isCameraOn && "hidden")}
          />

          {!isCameraOn && (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Camera className="size-12" />
              <span className="text-sm">Câmera desligada</span>
            </div>
          )}

          {isCameraOn && isProcessing && (
            <div className="absolute right-2 top-2 animate-pulse rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              🖐 Analisando...
            </div>
          )}
        </div>

        <Button
          variant={isCameraOn ? "outline" : "secondary"}
          onClick={isCameraOn ? handleStop : handleStart}
        >
          {isCameraOn ? <CameraOff /> : <Camera />}
          {isCameraOn ? "Parar câmera" : "Iniciar câmera"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
