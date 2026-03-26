import { describe, it, expect } from 'vitest';
import { IndustryRole } from '../../domain/aggregates/industry-role.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  departmentId: 'dept-1',
  industryId: 'industry-1',
  name: 'Field Engineer',
  seniorityLevel: 'Associate',
  createdBy: 'user-1'
};

describe('IndustryRole aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const role = IndustryRole.create({
        ...baseProps,
        reportingTo: 'Engineering Manager',
        roleCriticalityScore: 0.75
      });
      expect(role.tenantId).toBe('tenant-1');
      expect(role.departmentId).toBe('dept-1');
      expect(role.industryId).toBe('industry-1');
      expect(role.name).toBe('Field Engineer');
      expect(role.seniorityLevel).toBe('Associate');
      expect(role.reportingTo).toBe('Engineering Manager');
      expect(role.roleCriticalityScore).toBe(0.75);
      expect(role.createdBy).toBe('user-1');
    });

    it('optional fields default to undefined when not provided', () => {
      const role = IndustryRole.create(baseProps);
      expect(role.reportingTo).toBeUndefined();
      expect(role.roleCriticalityScore).toBeUndefined();
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
      expect(role.seniorityLevel).toBe('Associate');
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

      role.update({ name: 'Senior Field Engineer', seniorityLevel: 'Team Lead' });

      expect(role.name).toBe('Senior Field Engineer');
      expect(role.seniorityLevel).toBe('Team Lead');
      expect(role.domainEvents).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const role = IndustryRole.create({ ...baseProps, roleCriticalityScore: 0.6 });
      role.clearDomainEvents();

      role.update({ name: 'Renamed Role' });

      expect(role.roleCriticalityScore).toBe(0.6);
      expect(role.departmentId).toBe('dept-1');
    });

    it('updates reportingTo and roleCriticalityScore', () => {
      const role = IndustryRole.create(baseProps);
      role.clearDomainEvents();

      role.update({ reportingTo: 'CTO', roleCriticalityScore: 0.9 });

      expect(role.reportingTo).toBe('CTO');
      expect(role.roleCriticalityScore).toBe(0.9);
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
