"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Camera, CameraOff, Hand, Square } from "lucide-react";

import { CaptureStatusPill } from "@/components/room/mobile-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLibrasCapture } from "@/hooks/useLibrasCapture";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/store/useRoomStore";

import { PILL } from "./mobile-overlays";

const ROUND_OVERLAY_BUTTON =
  "flex size-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform active:scale-95 disabled:opacity-50";

const DESKTOP_PILL =
  "absolute top-3 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm";

type RoomCameraProps = {
  /** Mobile: de ponta a ponta, controles sobrepostos ao vídeo. */
  mobile: boolean;
  /** Botão extra no canto superior direito, só no mobile (ex.: tela cheia). */
  topRight?: ReactNode;
  className?: string;
};

/**
 * Câmera da pessoa surda, nos dois layouts da /sala.
 *
 * O <video> (e a captura do MediaPipe ligada a ele) fica sempre na mesma
 * posição da árvore: trocar de layout não desliga a câmera. Card/CardContent
 * são usados também no mobile (sem moldura) pelo mesmo motivo.
 */
export function RoomCamera({ mobile, topRight, className }: RoomCameraProps) {
  const isCameraOn = useRoomStore((state) => state.isCameraOn);
  const setCameraOn = useRoomStore((state) => state.setCameraOn);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { status, handsDetected, lastError, startManual, stopManual } = useLibrasCapture(
    videoRef,
    isCameraOn
  );

  useEffect(() => {
    streamRef.current = stream;
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Erro ao dar play no vídeo:", err);
      });
    }
  }, [stream]);

  // Ao sair da sala, libera a câmera.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setCameraOn(false);
    };
  }, [setCameraOn]);

  async function handleStart() {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOn(true);
    } catch {
      setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
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

  const toggleManual = status === "capturing" ? stopManual : startManual;

  return (
    <Card
      role="region"
      aria-label="Câmera — Libras"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden",
        mobile
          ? "gap-0 rounded-none bg-transparent py-0 ring-0"
          : "border-border shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {!mobile && (
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base font-medium">
            <Hand className="size-4 text-primary" />
            Câmera — Libras
          </CardTitle>
          <p className="text-sm text-muted-foreground">Faça sinais para tradução automática</p>
        </CardHeader>
      )}

      <CardContent className={cn("flex min-h-0 flex-1 flex-col", mobile ? "px-0" : "gap-4")}>
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden",
            !mobile && "rounded-lg",
            isCameraOn ? "bg-slate-900" : "bg-gradient-to-br from-secondary to-muted"
          )}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={cn("size-full object-cover", !isCameraOn && "hidden")}
          />

          {!isCameraOn &&
            (mobile ? (
              <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-card shadow-sm">
                  <Hand className="size-7 text-muted-foreground" />
                </div>
                <Button size="lg" className="h-11 gap-2 px-6 text-base" onClick={handleStart}>
                  <Camera />
                  Iniciar câmera
                </Button>
                {error && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2">
                <div className="flex size-20 items-center justify-center rounded-full bg-card shadow-sm">
                  <Camera className="size-10 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Câmera desligada</span>
                <span className="text-xs text-muted-foreground">Clique abaixo para começar</span>
              </div>
            ))}

          {isCameraOn &&
            (mobile ? (
              <>
                <div className="absolute top-2 right-14 left-2 flex flex-col items-start gap-1.5">
                  <CaptureStatusPill status={status} handsDetected={handsDetected} />
                  {lastError && (
                    <p className={cn(PILL, "max-w-full text-destructive")}>
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span className="truncate">{lastError}</span>
                    </p>
                  )}
                </div>

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={
                      status === "capturing" ? "Parar captura manual" : "Capturar sinal (manual)"
                    }
                    title={status === "capturing" ? "Parar captura" : "Capturar sinal"}
                    onClick={toggleManual}
                    disabled={status === "analyzing"}
                    className={ROUND_OVERLAY_BUTTON}
                  >
                    {status === "capturing" ? (
                      <Square className="size-4 fill-current" />
                    ) : (
                      <Hand className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Desligar câmera"
                    title="Desligar câmera"
                    onClick={handleStop}
                    className={ROUND_OVERLAY_BUTTON}
                  >
                    <CameraOff className="size-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {handsDetected && (
                  <div className="absolute top-3 left-3 rounded-full border border-border bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                    Mãos detectadas
                  </div>
                )}
                {status === "capturing" && (
                  <div className={cn(DESKTOP_PILL, "right-3")}>
                    <span className="size-2 animate-pulse rounded-full bg-teal-500" />
                    Capturando sinal...
                  </div>
                )}
                {status === "analyzing" && (
                  <div className={cn(DESKTOP_PILL, "right-3")}>
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    Analisando...
                  </div>
                )}
              </>
            ))}

          {mobile && topRight && <div className="absolute top-2 right-2">{topRight}</div>}
        </div>

        {!mobile && (
          <>
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
                onClick={toggleManual}
                disabled={status === "analyzing"}
              >
                {status === "capturing" ? "Parar captura manual" : "Capturar sinal (manual)"}
              </Button>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
