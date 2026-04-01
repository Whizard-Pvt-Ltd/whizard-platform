export interface SpecializationRecord {
  id: string;
  name: string;
}

export interface DegreeProgramRecord {
  id: string;
  name: string;
  level: string;
  durationYears: number | null;
  specializations: SpecializationRecord[];
}

export interface IDegreeProgramRepository {
  findAll(): Promise<DegreeProgramRecord[]>;
}
