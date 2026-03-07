export class AccessDecisionPolicy {
  ensureTenantScoped(input: {
    principalTenantType: string;
    principalTenantId: string;
    requestTenantType: string;
    requestTenantId: string;
  }): boolean {
    return (
      input.principalTenantType === input.requestTenantType &&
      input.principalTenantId === input.requestTenantId
    );
  }
}
