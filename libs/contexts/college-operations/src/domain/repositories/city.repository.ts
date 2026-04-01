export interface CityRecord {
  id: string;
  name: string;
  state: string;
}

export interface ICityRepository {
  findAll(): Promise<CityRecord[]>;
}
