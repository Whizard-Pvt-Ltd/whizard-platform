export class FederationPolicy {
  ensureProviderEnabled(status: 'ACTIVE' | 'DISABLED'): void {
    if (status !== 'ACTIVE') {
      throw new Error('Identity provider is not active.');
    }
  }
}
