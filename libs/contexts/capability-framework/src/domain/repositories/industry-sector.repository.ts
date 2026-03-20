export interface IndustrySectorRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface IIndustrySectorRepository {
  findAll(): Promise<IndustrySectorRecord[]>;
}
