import { getPrisma } from '@whizard/shared-infrastructure';
import type { UserContactDto } from '../dto/college.dto.js';

export class ListUsersForContactsQueryHandler {
  async execute(tenantId: string): Promise<UserContactDto[]> {
    const prisma = getPrisma();
    const users = await prisma.userAccount.findMany({
      where: { isActive: true },
      select: { id: true, primaryEmail: true },
      orderBy: { primaryEmail: 'asc' },
    });

    return users.map(u => ({
      id: u.id.toString(),
      primaryEmail: u.primaryEmail,
      displayName: u.primaryEmail.split('@')[0] ?? u.primaryEmail,
    }));
  }
}
