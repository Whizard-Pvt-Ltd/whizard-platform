export interface IndustrySectorRecord {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface IIndustrySectorRepository {
  findAll(): Promise<IndustrySectorRecord[]>;
}
