export type MessageSource = 'libras' | 'speech' | 'text';

export interface Message {
  id: string;
  source: MessageSource;
  content: string;
  confidence?: number;
  tokens?: string[];
  timestamp: string;
}

export interface STTResponse {
  text: string;
  confidence: number;
  durationMs: number;
}

export interface LibrasResponse {
  text: string;
  confidence: number;
  tokens: string[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}
