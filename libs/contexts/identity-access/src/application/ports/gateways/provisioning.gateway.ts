export interface ProvisioningGateway {
  issueInvitationToken(input: { invitationId: string; tenantId: string }): Promise<string>;
}
