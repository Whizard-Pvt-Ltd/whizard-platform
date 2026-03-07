export interface VerifyMfaChallengeRequestDto {
  readonly actorUserAccountId: string;
  readonly tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  readonly tenantId: string;
  readonly payload: Record<string, unknown>;
}
