export interface IamUserAccountCreatedV1 {
  userAccountId: string;
  email: string;
  tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
  tenantId: string;
  mfaRequired: boolean;
}
