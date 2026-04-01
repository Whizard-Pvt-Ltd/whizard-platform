export interface ClubRecord {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

export interface IClubRepository {
  findAll(tenantId: string): Promise<ClubRecord[]>;
}
