import type { Company } from '../aggregates/company.aggregate.js';

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findAll(tenantId: string, search?: string): Promise<Company[]>;
  save(company: Company): Promise<string>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
}
