// Pipeline de montagem da sequência 64x126 enviada ao backend de Libras.
// Especificação EXATA do treino (Fabi) — não alterar sem confirmar com ela.

import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export const FRAME_SIZE = 126;
export const SEQ_LEN = 64;
export const HAND_SIZE = 63;
const EPS = 1e-6;

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// 63 valores crus do MediaPipe, ponto a ponto [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20].
export type Hand = number[];

export interface RawFrame {
  left: Hand | null;
  right: Hand | null;
}

export function emptyHand(): Hand {
  return new Array(HAND_SIZE).fill(0);
}

// 21 pontos → 63 valores crus (com z), sem dividir por resolução do frame.
export function landmarksToHand(landmarks: Landmark[]): Hand {
  const out: Hand = [];
  for (const point of landmarks) {
    out.push(point.x, point.y, point.z);
  }
  return out;
}

// Usa o handedness do MediaPipe diretamente ("Left"/"Right"). Sem swap manual,
// sem decidir por posição na tela. O vídeo processado não deve estar espelhado
// via pixels/canvas — se houver espelhamento visual, é só CSS.
export function rawFrameFromResult(result: HandLandmarkerResult): RawFrame {
  let left: Hand | null = null;
  let right: Hand | null = null;

  const landmarksList = result.landmarks ?? [];
  const handednessList = result.handedness ?? [];

  for (let i = 0; i < landmarksList.length; i++) {
    const category = handednessList[i]?.[0]?.categoryName;
    const hand = landmarksToHand(landmarksList[i]);
    if (category === 'Left') {
      left = hand;
    } else if (category === 'Right') {
      right = hand;
    }
  }

  return { left, right };
}

// Remove frames do começo e do fim onde nenhuma mão foi detectada.
export function trimEmpty(frames: RawFrame[]): RawFrame[] {
  let start = 0;
  let end = frames.length - 1;

  while (start <= end && frames[start].left === null && frames[start].right === null) {
    start++;
  }
  while (end >= start && frames[end].left === null && frames[end].right === null) {
    end--;
  }

  return frames.slice(start, end + 1);
}

// Interpola/segura os nulls de uma única mão ao longo da sequência.
// Bordas: hold do valor presente mais próximo. Gaps internos: interpolação
// linear componente a componente. Mão nunca presente: permanece null.
function fillHandGaps(hands: (Hand | null)[]): (Hand | null)[] {
  const presentIndices: number[] = [];
  for (let i = 0; i < hands.length; i++) {
    if (hands[i] !== null) presentIndices.push(i);
  }
  if (presentIndices.length === 0) return hands.slice();

  const out = hands.slice();

  const first = presentIndices[0];
  for (let i = 0; i < first; i++) out[i] = hands[first];

  const last = presentIndices[presentIndices.length - 1];
  for (let i = last + 1; i < hands.length; i++) out[i] = hands[last];

  for (let k = 0; k < presentIndices.length - 1; k++) {
    const a = presentIndices[k];
    const b = presentIndices[k + 1];
    if (b - a <= 1) continue;

    const handA = hands[a] as Hand;
    const handB = hands[b] as Hand;
    for (let i = a + 1; i < b; i++) {
      const t = (i - a) / (b - a);
      out[i] = handA.map((v, idx) => v + (handB[idx] - v) * t);
    }
  }

  return out;
}

export function fillGaps(frames: RawFrame[]): RawFrame[] {
  const lefts = fillHandGaps(frames.map((f) => f.left));
  const rights = fillHandGaps(frames.map((f) => f.right));
  return frames.map((_, i) => ({ left: lefts[i], right: rights[i] }));
}

// N x 126; mão null vira 63 zeros.
export function toMatrix(frames: RawFrame[]): number[][] {
  return frames.map((f) => [...(f.left ?? emptyHand()), ...(f.right ?? emptyHand())]);
}

// Reamostra p/ exatamente 64 frames, interpolação linear feature a feature
// (equivalente a np.interp com src=linspace(0,1,N), dst=linspace(0,1,64)).
export function resampleTo64(matrix: number[][]): number[][] {
  const n = matrix.length;

  if (n === 0) {
    return Array.from({ length: SEQ_LEN }, () => new Array(FRAME_SIZE).fill(0));
  }
  if (n === 1) {
    return Array.from({ length: SEQ_LEN }, () => matrix[0].slice());
  }

  const out: number[][] = [];
  for (let j = 0; j < SEQ_LEN; j++) {
    const pos = (j * (n - 1)) / (SEQ_LEN - 1);
    const idx0 = Math.floor(pos);
    const idx1 = Math.min(idx0 + 1, n - 1);
    const frac = pos - idx0;

    const rowA = matrix[idx0];
    const rowB = matrix[idx1];
    const row = rowA.map((v, i) => v + (rowB[i] - v) * frac);
    out.push(row);
  }
  return out;
}

// Wrist-relative (landmark 0) + escala pela distância wrist→middle-MCP (landmark 9),
// aplicada nas coordenadas originais. Última etapa do pipeline.
export function normalizeHand(hand: Hand): Hand {
  if (hand.every((v) => v === 0)) return emptyHand();

  const wristX = hand[0];
  const wristY = hand[1];
  const wristZ = hand[2];

  const translated: Hand = [];
  for (let i = 0; i < HAND_SIZE; i += 3) {
    translated.push(hand[i] - wristX, hand[i + 1] - wristY, hand[i + 2] - wristZ);
  }

  const mcpX = translated[9 * 3];
  const mcpY = translated[9 * 3 + 1];
  const mcpZ = translated[9 * 3 + 2];
  let scale = Math.sqrt(mcpX * mcpX + mcpY * mcpY + mcpZ * mcpZ);

  if (scale < EPS) {
    let maxNorm = 0;
    for (let i = 0; i < HAND_SIZE; i += 3) {
      const x = translated[i];
      const y = translated[i + 1];
      const z = translated[i + 2];
      const norm = Math.sqrt(x * x + y * y + z * z);
      if (norm > maxNorm) maxNorm = norm;
    }
    scale = maxNorm;
  }

  if (scale < EPS) return emptyHand();

  return translated.map((v) => v / scale);
}

export function normalizeMatrix(matrix: number[][]): number[][] {
  return matrix.map((frame) => [
    ...normalizeHand(frame.slice(0, HAND_SIZE)),
    ...normalizeHand(frame.slice(HAND_SIZE, FRAME_SIZE)),
  ]);
}

// ORDEM IMPORTA: trim → fillGaps → toMatrix → resample → normalize (por último).
export function assembleSequence(rawFrames: RawFrame[]): number[][] {
  const trimmed = trimEmpty(rawFrames);
  const filled = fillGaps(trimmed);
  const matrix = toMatrix(filled);
  const resampled = resampleTo64(matrix);
  return normalizeMatrix(resampled);
}
