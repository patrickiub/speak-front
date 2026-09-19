"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

import { predictSign } from "@/lib/api";
import { assembleSequence, buildFrame, type DetectedHand } from "@/lib/libras-sequence";
import { useRoomStore } from "@/store/useRoomStore";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const MODEL_URL = "/models/hand_landmarker.task";

const START_FRAMES_THRESHOLD = 3; // mãos detectadas por N frames seguidos p/ iniciar captura
const PAUSE_FRAMES_THRESHOLD = 12; // ausência de mãos por N frames seguidos p/ finalizar captura
const MAX_CAPTURE_MS = 5000; // trava de segurança
const MIN_FRAMES_TO_SEND = 10; // descarta gesto curto demais / ruído
const COOLDOWN_MS = 800;

export type LibrasCaptureStatus = "idle" | "capturing" | "analyzing";

export function useLibrasCapture(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const [status, setStatus] = useState<LibrasCaptureStatus>("idle");
  const [handsDetected, setHandsDetected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const addMessage = useRoomStore((state) => state.addMessage);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const framesRef = useRef<number[][]>([]);
  const statusRef = useRef<LibrasCaptureStatus>("idle");
  const presentStreakRef = useRef(0);
  const absentStreakRef = useRef(0);
  const captureStartRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const manualRef = useRef(false);

  const setStatusBoth = useCallback((next: LibrasCaptureStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const finishCapture = useCallback(
    async (reason: "auto" | "manual") => {
      const frames = framesRef.current;
      framesRef.current = [];
      presentStreakRef.current = 0;
      absentStreakRef.current = 0;
      manualRef.current = false;

      if (frames.length < MIN_FRAMES_TO_SEND) {
        setStatusBoth("idle");
        return;
      }

      setStatusBoth("analyzing");
      try {
        const sequence = assembleSequence(frames);
        const response = await predictSign(sequence);
        if (response.success && response.prediction) {
          addMessage({
            source: "libras",
            content: response.prediction,
            distance: response.distance,
            top3: response.top3,
          });
        } else if (response.error) {
          setLastError(response.error);
        }
      } catch (err) {
        setLastError(err instanceof Error ? err.message : "Erro ao processar sinal");
      } finally {
        void reason;
        cooldownUntilRef.current = performance.now() + COOLDOWN_MS;
        setStatusBoth("idle");
      }
    },
    [addMessage, setStatusBoth]
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
          },
          runningMode: "VIDEO",
          numHands: 2,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        loop();
      } catch (err) {
        setLastError(err instanceof Error ? err.message : "Erro ao inicializar MediaPipe");
      }
    }

    function loop() {
      rafRef.current = requestAnimationFrame(loop);

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) return;

      const now = performance.now();
      if (now < cooldownUntilRef.current) return;

      const result = landmarker.detectForVideo(video, now);
      const hands: DetectedHand[] = (result.landmarks ?? []).map((landmarks, i) => ({
        landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z })),
        handedness: (result.handedness?.[i]?.[0]?.categoryName as "Left" | "Right") ?? "Right",
      }));

      const anyHand = hands.length > 0;
      setHandsDetected(anyHand);

      if (statusRef.current === "idle") {
        if (anyHand) {
          presentStreakRef.current += 1;
          if (presentStreakRef.current >= START_FRAMES_THRESHOLD) {
            presentStreakRef.current = 0;
            absentStreakRef.current = 0;
            framesRef.current = [buildFrame(hands)];
            captureStartRef.current = now;
            setStatusBoth("capturing");
          }
        } else {
          presentStreakRef.current = 0;
        }
        return;
      }

      if (statusRef.current === "capturing") {
        framesRef.current.push(buildFrame(hands));

        if (anyHand) {
          absentStreakRef.current = 0;
        } else {
          absentStreakRef.current += 1;
        }

        const elapsed = now - captureStartRef.current;
        if (absentStreakRef.current >= PAUSE_FRAMES_THRESHOLD || elapsed >= MAX_CAPTURE_MS) {
          void finishCapture("auto");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      framesRef.current = [];
      presentStreakRef.current = 0;
      absentStreakRef.current = 0;
      statusRef.current = "idle";
      setStatus("idle");
      setHandsDetected(false);
    };
  }, [enabled, videoRef, finishCapture, setStatusBoth]);

  const startManual = useCallback(() => {
    if (statusRef.current !== "idle") return;
    manualRef.current = true;
    framesRef.current = [];
    presentStreakRef.current = 0;
    absentStreakRef.current = 0;
    captureStartRef.current = performance.now();
    setStatusBoth("capturing");
  }, [setStatusBoth]);

  const stopManual = useCallback(() => {
    if (statusRef.current !== "capturing") return;
    void finishCapture("manual");
  }, [finishCapture]);

  return { status, handsDetected, lastError, startManual, stopManual };
}
