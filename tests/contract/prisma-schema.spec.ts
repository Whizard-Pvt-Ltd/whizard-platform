import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('prisma schema', () => {
  it('contains IAM identity, access policy, session, and outbox models', () => {
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('model UserAccount');
    expect(schema).toContain('model AccessPrincipal');
    expect(schema).toContain('model RoleAssignment');
    expect(schema).toContain('model PermissionGrant');
    expect(schema).toContain('model ScopeRestriction');
    expect(schema).toContain('model UserSession');
    expect(schema).toContain('model OutboxEvent');
  });
});
