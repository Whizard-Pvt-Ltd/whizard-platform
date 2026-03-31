import { describe, it, expect } from 'vitest';
import { IndustryRole } from '../../domain/aggregates/industry-role.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  departmentId: 'dept-1',
  name: 'Field Engineer'
};

describe('IndustryRole aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const role = IndustryRole.create({ ...baseProps, description: 'Responsible for field ops' });
      expect(role.tenantId).toBe('tenant-1');
      expect(role.departmentId).toBe('dept-1');
      expect(role.name).toBe('Field Engineer');
      expect(role.description).toBe('Responsible for field ops');
    });

    it('description defaults to undefined when not provided', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.description).toBeUndefined();
    });

    it('emits an IndustryRoleCreatedEvent', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.domainEvents).toHaveLength(1);
      expect(role.domainEvents[0].aggregateId).toBe(role.id);
      expect(role.domainEvents[0].tenantId).toBe('tenant-1');
    });
  });

  describe('reconstitute()', () => {
    it('restores props with the given id', () => {
      const role = IndustryRole.reconstitute({ ...baseProps, id: 'role-99' });
      expect(role.id).toBe('role-99');
      expect(role.name).toBe('Field Engineer');
    });

    it('does not emit any domain events', () => {
      const role = IndustryRole.reconstitute({ ...baseProps, id: 'role-99' });
      expect(role.domainEvents).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('mutates provided fields and emits an updated event', () => {
      const role = IndustryRole.create(baseProps);
      role.clearDomainEvents();

      role.update({ name: 'Senior Field Engineer', description: 'Updated desc' });

      expect(role.name).toBe('Senior Field Engineer');
      expect(role.description).toBe('Updated desc');
      expect(role.domainEvents).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const role = IndustryRole.create(baseProps);
      role.clearDomainEvents();

      role.update({ name: 'Renamed Role' });

      expect(role.departmentId).toBe('dept-1');
    });
  });

  describe('delete()', () => {
    it('emits a deleted event', () => {
      const role = IndustryRole.create(baseProps);
      role.clearDomainEvents();
      role.delete();
      expect(role.domainEvents).toHaveLength(1);
    });
  });

  describe('clearDomainEvents()', () => {
    it('removes all pending events', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.domainEvents).toHaveLength(1);
      role.clearDomainEvents();
      expect(role.domainEvents).toHaveLength(0);
    });
  });
});
