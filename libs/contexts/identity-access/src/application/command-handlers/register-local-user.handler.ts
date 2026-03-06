import {
  EmailAddress,
  TenantRef,
  UserAccount,
  UserAccountId
} from '../../domain';
import type { RegisterLocalUserCommand } from '../commands/register-local-user.command';
import type { RegisterLocalUserResponse } from '../dto/register-local-user.response';
import { mapDomainEventsToEnvelopes } from '../mappers/domain-event-to-envelope.mapper';
import type { OutboxPort } from '../ports/event-bus/outbox.port';
import type { UserAccountRepository } from '../ports/repositories/user-account.repository';

export class RegisterLocalUserHandler {
  constructor(
    private readonly userAccountRepository: UserAccountRepository,
    private readonly outbox: OutboxPort
  ) {}

  async execute(command: RegisterLocalUserCommand): Promise<RegisterLocalUserResponse> {
    const email = EmailAddress.create(command.email);
    const existing = await this.userAccountRepository.findByEmail(email.value);

    if (existing) {
      throw new Error(`User already exists for email ${email.value}`);
    }

    const userAccount = UserAccount.registerLocal({
      id: UserAccountId.create(),
      email,
      tenant: TenantRef.create({
        tenantType: command.tenantType,
        tenantId: command.tenantId
      }),
      mfaRequired: command.mfaRequired ?? true
    });

    await this.userAccountRepository.save(userAccount);
    await this.outbox.append(mapDomainEventsToEnvelopes(userAccount.pullDomainEvents()));

    return { userAccountId: userAccount.id.value };
  }
}
