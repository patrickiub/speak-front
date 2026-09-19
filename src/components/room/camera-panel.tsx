"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Hand } from "lucide-react";

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

  const { status, handsDetected, startManual, stopManual } = useLibrasCapture(
    videoRef,
    isCameraOn
  );

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
    <Card className="flex min-h-[280px] flex-col overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md md:min-h-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-medium">
          <Hand className="size-4 text-primary" />
          Câmera — Libras
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Faça sinais para tradução automática
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:min-h-0 md:flex-1">
        <div
          className={cn(
            "relative aspect-video w-full min-h-[240px] overflow-hidden rounded-lg md:aspect-auto md:h-full md:min-h-0 md:flex-1",
            isCameraOn ? "bg-slate-900" : "bg-gradient-to-br from-secondary to-muted"
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
            <div className="flex size-full flex-col items-center justify-center gap-2">
              <div className="flex size-20 items-center justify-center rounded-full bg-card shadow-sm">
                <Camera className="size-10 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">Câmera desligada</span>
              <span className="text-xs text-muted-foreground">
                Clique abaixo para começar
              </span>
            </div>
          )}

          {isCameraOn && handsDetected && (
            <div className="absolute left-3 top-3 rounded-full border border-border bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              Mãos detectadas
            </div>
          )}

          {isCameraOn && status === "capturing" && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <span className="size-2 animate-pulse rounded-full bg-teal-500" />
              Capturando sinal...
            </div>
          )}

          {isCameraOn && status === "analyzing" && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              Analisando...
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

        {/* Fallback manual: pode ser ocultado na demo se a segmentação automática estiver estável. */}
        {isCameraOn && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-xs text-muted-foreground"
            onClick={status === "capturing" ? stopManual : startManual}
            disabled={status === "analyzing"}
          >
            {status === "capturing" ? "Parar captura manual" : "Capturar sinal (manual)"}
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
