// Cliente HTTP para o backend do Speak.
// As funções abaixo são mocks e serão substituídas pelas chamadas reais
// (fetch para NEXT_PUBLIC_API_URL) quando o backend estiver pronto.

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

const LIBRAS_MOCK_RESPONSES: LibrasResponse[] = [
  { text: 'olá tudo bem', confidence: 0.87, tokens: ['olá', 'tudo', 'bem'] },
  { text: 'obrigado', confidence: 0.94, tokens: ['obrigado'] },
  { text: 'preciso de ajuda', confidence: 0.78, tokens: ['preciso', 'ajuda'] },
];

export async function recognizeLibras(videoBlob: Blob): Promise<LibrasResponse> {
  void videoBlob;
  await wait(1200);
  const index = Math.floor(Math.random() * LIBRAS_MOCK_RESPONSES.length);
  return LIBRAS_MOCK_RESPONSES[index];
}
