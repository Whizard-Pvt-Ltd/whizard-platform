import { getPrisma } from '@whizard/shared-infrastructure';
import type { AccessPrincipalRepository } from '../../../../application/ports/repositories/access-principal.repository';
import { AccessPrincipal } from '../../../../domain/aggregates/access-policy/access-principal.aggregate';
import { toAccessPrincipalDomain } from '../mappers/access-principal.persistence.mapper';

export class PrismaAccessPrincipalRepository implements AccessPrincipalRepository {
  private readonly prisma = getPrisma();

  async findById(id: string): Promise<AccessPrincipal | null> {
    const principal = await this.prisma.accessPrincipal.findUnique({ where: { id } });

    if (!principal) {
      return null;
    }

    const [roles, permissions, restrictions] = await Promise.all([
      this.prisma.roleAssignment.findMany({ where: { accessPrincipalId: principal.id } }),
      this.prisma.permissionGrant.findMany({ where: { accessPrincipalId: principal.id } }),
      this.prisma.scopeRestriction.findMany({ where: { accessPrincipalId: principal.id } })
    ]);

    return toAccessPrincipalDomain({ principal, roles, permissions, restrictions });
  }

  async findByUserAndTenant(input: {
    userAccountId: string;
    tenantType: 'SYSTEM' | 'PARENT_CLUB' | 'COLLEGE' | 'COMPANY';
    tenantId: string;
  }): Promise<AccessPrincipal | null> {
    const principal = await this.prisma.accessPrincipal.findUnique({
      where: {
        userAccountId_tenantType_tenantId: {
          userAccountId: input.userAccountId,
          tenantType: input.tenantType,
          tenantId: input.tenantId
        }
      }
    });

    if (!principal) {
      return null;
    }

    return this.findById(principal.id);
  }

  async save(accessPrincipal: AccessPrincipal): Promise<void> {
    const model = accessPrincipal.toPrimitives();

    await this.prisma.$transaction(async (tx) => {
      await tx.accessPrincipal.upsert({
        where: { id: model.id },
        update: {
          status: model.status,
          version: model.version + 1
        },
        create: {
          id: model.id,
          userAccountId: model.userAccountId,
          tenantType: model.tenantType,
          tenantId: model.tenantId,
          status: model.status,
          createdAt: model.createdAt,
          version: model.version
        }
      });

      await tx.roleAssignment.deleteMany({ where: { accessPrincipalId: model.id } });
      await tx.permissionGrant.deleteMany({ where: { accessPrincipalId: model.id } });
      await tx.scopeRestriction.deleteMany({ where: { accessPrincipalId: model.id } });

      if (model.roles.length > 0) {
        await tx.roleAssignment.createMany({
          data: model.roles.map((role) => ({
            id: role.id,
            accessPrincipalId: model.id,
            roleCode: role.roleCode,
            assignedBy: role.assignedBy,
            assignedAt: role.assignedAt,
            validFrom: role.validFrom,
            validTo: role.validTo,
            status: role.status
          }))
        });
      }

      if (model.permissions.length > 0) {
        await tx.permissionGrant.createMany({
          data: model.permissions.map((grant) => ({
            id: grant.id,
            accessPrincipalId: model.id,
            permissionCode: grant.permissionCode,
            grantSource: grant.grantSource,
            scopeType: grant.scopeType,
            scopeValue: grant.scopeValue,
            grantedAt: grant.grantedAt,
            revokedAt: grant.revokedAt
          }))
        });
      }

      if (model.restrictions.length > 0) {
        await tx.scopeRestriction.createMany({
          data: model.restrictions.map((restriction) => ({
            id: restriction.id,
            accessPrincipalId: model.id,
            resourceType: restriction.resourceType,
            restrictionType: restriction.restrictionType,
            scopeExpression: restriction.scopeExpression,
            createdAt: restriction.createdAt
          }))
        });
      }
    });
  }
}
