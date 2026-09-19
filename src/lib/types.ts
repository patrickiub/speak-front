export type MessageSource = 'libras' | 'speech' | 'text';

export interface Message {
  id: string;
  source: MessageSource;
  content: string;
  confidence?: number;
  tokens?: string[];
  distance?: number;
  top3?: LibrasTop3[];
  timestamp: string;
}

export interface STTResponse {
  text: string;
  confidence: number;
  durationMs: number;
}

export interface LibrasTop3 {
  label: string;
  distance: number;
}

export interface LibrasResponse {
  success: boolean;
  prediction: string;
  distance: number;
  top3: LibrasTop3[];
  error: string | null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}
