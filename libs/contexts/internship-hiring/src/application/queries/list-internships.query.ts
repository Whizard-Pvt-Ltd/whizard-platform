export interface ListInternshipsQuery {
  tenantId: string;
  companyTenantId?: string;
  allTenants?: boolean;
  search?: string;
  status?: string;
}
