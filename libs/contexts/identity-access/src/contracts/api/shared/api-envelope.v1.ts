import type { ApiErrorV1, ApiMetaV1 } from './api-meta.v1';

export interface ApiSuccessEnvelopeV1<TData> {
  success: true;
  data: TData;
  meta: ApiMetaV1;
}

export interface ApiFailureEnvelopeV1 {
  success: false;
  error: ApiErrorV1;
  meta: ApiMetaV1;
}

export type ApiEnvelopeV1<TData> = ApiSuccessEnvelopeV1<TData> | ApiFailureEnvelopeV1;
