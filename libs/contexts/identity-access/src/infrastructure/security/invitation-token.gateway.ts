import { createHmac } from 'node:crypto';
import type { ProvisioningGateway } from '../../application/ports/gateways/provisioning.gateway';

export interface InvitationTokenConfig {
  readonly secret: string;
}

const loadConfig = (): InvitationTokenConfig => {
  const secret = process.env.IAM_INVITATION_TOKEN_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('IAM_INVITATION_TOKEN_SECRET must be set and at least 32 characters long.');
  }

  return { secret };
};

export class InvitationTokenGateway implements ProvisioningGateway {
  constructor(private readonly config: InvitationTokenConfig = loadConfig()) {}

  async issueInvitationToken(input: { invitationId: string; tenantId: string }): Promise<string> {
    const payload = `${input.invitationId}:${input.tenantId}`;
    const signature = createHmac('sha256', this.config.secret).update(payload).digest('base64url');
    return Buffer.from(payload).toString('base64url') + '.' + signature;
  }
}
