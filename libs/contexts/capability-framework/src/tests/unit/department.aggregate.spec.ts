import { describe, it, expect } from 'vitest';
import { Department } from '../../domain/aggregates/department.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  industryId: 'industry-1',
  name: 'Engineering',
  functionalGroupIds: ['fg-1', 'fg-2']
};

describe('Department aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const dept = Department.create(baseProps);
      expect(dept.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const dept = Department.create({
        ...baseProps,
        operationalCriticalityScore: 0.8,
        revenueContributionWeight: 0.5,
        regulatoryExposureLevel: 0.3
      });
      expect(dept.tenantId).toBe('tenant-1');
      expect(dept.industryId).toBe('industry-1');
      expect(dept.name).toBe('Engineering');
      expect(dept.functionalGroupIds).toEqual(['fg-1', 'fg-2']);
      expect(dept.operationalCriticalityScore).toBe(0.8);
      expect(dept.revenueContributionWeight).toBe(0.5);
      expect(dept.regulatoryExposureLevel).toBe(0.3);
    });

    it('optional score fields default to undefined when not provided', () => {
      const dept = Department.create(baseProps);
      expect(dept.operationalCriticalityScore).toBeUndefined();
      expect(dept.revenueContributionWeight).toBeUndefined();
      expect(dept.regulatoryExposureLevel).toBeUndefined();
    });

    it('emits a DepartmentCreatedEvent', () => {
      const dept = Department.create(baseProps);
      expect(dept.domainEvents).toHaveLength(1);
      expect(dept.domainEvents[0].aggregateId).toBe(dept.id);
      expect(dept.domainEvents[0].tenantId).toBe('tenant-1');
    });
  });

  describe('reconstitute()', () => {
    it('restores props with the given id', () => {
      const dept = Department.reconstitute({ ...baseProps, id: 'dept-42' });
      expect(dept.id).toBe('dept-42');
      expect(dept.name).toBe('Engineering');
    });

    it('does not emit any domain events', () => {
      const dept = Department.reconstitute({ ...baseProps, id: 'dept-42' });
      expect(dept.domainEvents).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('mutates provided fields and emits an updated event', () => {
      const dept = Department.create(baseProps);
      dept.clearDomainEvents();

      dept.update({ name: 'Operations', functionalGroupIds: ['fg-3'] });

      expect(dept.name).toBe('Operations');
      expect(dept.functionalGroupIds).toEqual(['fg-3']);
      expect(dept.domainEvents).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const dept = Department.create({ ...baseProps, operationalCriticalityScore: 0.9 });
      dept.clearDomainEvents();

      dept.update({ name: 'Renamed' });

      expect(dept.operationalCriticalityScore).toBe(0.9);
      expect(dept.functionalGroupIds).toEqual(['fg-1', 'fg-2']);
    });

    it('updates numeric scores', () => {
      const dept = Department.create(baseProps);
      dept.clearDomainEvents();

      dept.update({ operationalCriticalityScore: 0.7, revenueContributionWeight: 0.4 });

      expect(dept.operationalCriticalityScore).toBe(0.7);
      expect(dept.revenueContributionWeight).toBe(0.4);
    });
  });

  describe('delete()', () => {
    it('emits a deleted event', () => {
      const dept = Department.create(baseProps);
      dept.clearDomainEvents();
      dept.delete();
      expect(dept.domainEvents).toHaveLength(1);
    });
  });

  describe('clearDomainEvents()', () => {
    it('removes all pending events', () => {
      const dept = Department.create(baseProps);
      expect(dept.domainEvents).toHaveLength(1);
      dept.clearDomainEvents();
      expect(dept.domainEvents).toHaveLength(0);
    });
  });
});
