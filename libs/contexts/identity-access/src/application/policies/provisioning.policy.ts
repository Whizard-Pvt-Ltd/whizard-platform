export class ProvisioningPolicy {
  canReactivate(status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEPROVISIONED'): boolean {
    return status === 'SUSPENDED' || status === 'DEPROVISIONED';
  }
}
