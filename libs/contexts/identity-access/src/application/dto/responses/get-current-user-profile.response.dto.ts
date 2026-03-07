export interface GetCurrentUserProfileResponseDto {
  readonly success: boolean;
  readonly message: string;
  readonly data: Record<string, unknown>;
}
