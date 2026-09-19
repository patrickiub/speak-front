// Cliente HTTP para o backend do Speak.
// transcribeAudio segue mockado. predictSign usa mock quando NEXT_PUBLIC_API_URL
// está vazio, e faz POST real ao backend quando configurado.

import type { LibrasResponse, STTResponse } from '@/lib/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudio(audioBlob: Blob): Promise<STTResponse> {
  void audioBlob;
  await wait(800);
  return {
    text: 'Olá, tudo bem?',
    confidence: 0.92,
    durationMs: 3000,
  };
}

const PREDICT_SIGN_MOCK_RESPONSES: LibrasResponse[] = [
  {
    success: true,
    prediction: 'olá',
    distance: 0.12,
    top3: [
      { label: 'olá', distance: 0.12 },
      { label: 'oi', distance: 0.31 },
      { label: 'tudo bem', distance: 0.44 },
    ],
    error: null,
  },
  {
    success: true,
    prediction: 'obrigado',
    distance: 0.18,
    top3: [
      { label: 'obrigado', distance: 0.18 },
      { label: 'de nada', distance: 0.39 },
      { label: 'por favor', distance: 0.52 },
    ],
    error: null,
  },
  {
    success: true,
    prediction: 'preciso de ajuda',
    distance: 0.21,
    top3: [
      { label: 'preciso de ajuda', distance: 0.21 },
      { label: 'ajuda', distance: 0.35 },
      { label: 'socorro', distance: 0.5 },
    ],
    error: null,
  },
];

export async function predictSign(sequence: number[][]): Promise<LibrasResponse> {
  if (!API_URL) {
    await wait(600);
    const index = Math.floor(Math.random() * PREDICT_SIGN_MOCK_RESPONSES.length);
    return PREDICT_SIGN_MOCK_RESPONSES[index];
  }

  try {
    const res = await fetch(`${API_URL}/api/sign-language/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence }),
    });

    if (!res.ok) {
      return {
        success: false,
        prediction: '',
        distance: 0,
        top3: [],
        error: `Erro HTTP ${res.status}`,
      };
    }

    return (await res.json()) as LibrasResponse;
  } catch (err) {
    return {
      success: false,
      prediction: '',
      distance: 0,
      top3: [],
      error: err instanceof Error ? err.message : 'Erro de rede desconhecido',
    };
  }
}
