import type { Internship } from '../aggregates/internship.aggregate.js';

export interface InternshipListFilter {
  tenantId: string;
  search?: string;
  status?: string;
}

export interface IInternshipRepository {
  save(internship: Internship): Promise<string>;
  findById(id: string): Promise<Internship | null>;
  findAll(filter: InternshipListFilter): Promise<Internship[]>;
  delete(id: string): Promise<void>;
  findCityName(cityNumericId: string): Promise<string | null>;
}
