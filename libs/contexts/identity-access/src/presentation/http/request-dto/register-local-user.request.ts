export interface RegisterLocalUserRequestDto {
  email: string;
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  mfaRequired?: boolean;
}
