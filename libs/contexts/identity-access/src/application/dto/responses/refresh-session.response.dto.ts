export interface RefreshSessionResponseDto {
  readonly success: boolean;
  readonly message: string;
  readonly data: Record<string, unknown>;
}
