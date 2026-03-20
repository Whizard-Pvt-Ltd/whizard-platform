export interface IndustryRecord {
  id: string;
  sectorId: string;
  name: string;
  isActive: boolean;
}

export interface IIndustryRepository {
  findBySector(sectorId: string): Promise<IndustryRecord[]>;
}
