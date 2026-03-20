import type { Proficiency } from '../entities/proficiency.entity';

export interface IProficiencyRepository {
  findAll(): Promise<Proficiency[]>;
  findById(id: string): Promise<Proficiency | null>;
}
