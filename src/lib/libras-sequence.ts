// Helpers puros p/ montar a sequência 64x126 enviada ao backend de Libras.
// Stubs marcados abaixo dependem de detalhes do treino da Fabi — ajustar quando confirmado.

export const FRAME_SIZE = 126;
export const SEQ_LEN = 64;
export const HAND_SIZE = 63;

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedHand {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
}

export function emptyHand(): number[] {
  return new Array(HAND_SIZE).fill(0);
}

// STUB DE ORDEM: por enquanto ponto a ponto [x0,y0,z0, x1,y1,z1, ...].
// AJUSTAR conforme treino da Fabi se for agrupado por eixo.
export function landmarksToHand(landmarks: Landmark[]): number[] {
  const out: number[] = [];
  for (const point of landmarks) {
    out.push(point.x, point.y, point.z);
  }
  return out;
}

// STUB DE HANDEDNESS: usa o label handedness do MediaPipe ("Left"/"Right") p/ decidir a metade.
// AJUSTAR com a Fabi se o critério for posição na tela (atenção ao espelhamento selfie).
export function buildFrame(hands: DetectedHand[]): number[] {
  let left = emptyHand();
  let right = emptyHand();

  for (const hand of hands) {
    if (hand.handedness === 'Left') {
      left = landmarksToHand(hand.landmarks);
    } else if (hand.handedness === 'Right') {
      right = landmarksToHand(hand.landmarks);
    }
  }

  return [...left, ...right];
}

// STUB DE RESAMPLE: amostragem uniforme de índices como default.
// AJUSTAR conforme método usado no treino.
export function resampleTo64(frames: number[][]): number[][] {
  const n = frames.length;
  if (n === SEQ_LEN) return frames;

  if (n > SEQ_LEN) {
    const out: number[][] = [];
    for (let i = 0; i < SEQ_LEN; i++) {
      const idx = Math.floor((i * n) / SEQ_LEN);
      out.push(frames[idx]);
    }
    return out;
  }

  // n < SEQ_LEN: preenche repetindo o último frame disponível (padding).
  const out = frames.slice();
  const last = frames.length > 0 ? frames[frames.length - 1] : new Array(FRAME_SIZE).fill(0);
  while (out.length < SEQ_LEN) {
    out.push(last);
  }
  return out;
}

// STUB DE NORMALIZAÇÃO: identidade por enquanto. A normalização real
// (ex.: relativa ao pulso + escala) será plugada aqui conforme o treino da Fabi.
// NÃO inventar normalização que possa mascarar erro.
export function normalizeSequence(frames: number[][]): number[][] {
  return frames;
}

export function assembleSequence(rawFrames: number[][]): number[][] {
  return normalizeSequence(resampleTo64(rawFrames));
}
