export interface ApiMetaV1 {
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorV1 {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
