import type { College } from '../aggregates/college.aggregate.js';

export interface CollegeListFilter {
  tenantId: string;
  search?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface ICollegeRepository {
  findById(id: string): Promise<College | null>;
  findAll(filter: CollegeListFilter): Promise<{ items: College[]; total: number }>;
  save(college: College): Promise<void>;
  existsByName(tenantId: string, name: string, excludeId?: string): Promise<boolean>;
}
