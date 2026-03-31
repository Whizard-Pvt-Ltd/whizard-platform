import { describe, it, expect } from 'vitest';
import { ControlPoint } from '../../domain/aggregates/control-point.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  taskId: 'task-1',
  name: 'Pressure within threshold',
  riskLevel: 'High',
  failureImpactType: 'Safety',
  escalationRequired: true,
  evidenceType: 'Log'
};

describe('ControlPoint aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const cp = ControlPoint.create(baseProps);
      expect(cp.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const cp = ControlPoint.create({
        ...baseProps,
        description: 'Must be within 5% tolerance',
        kpiThreshold: 95
      });
      expect(cp.tenantId).toBe('tenant-1');
      expect(cp.taskId).toBe('task-1');
      expect(cp.name).toBe('Pressure within threshold');
      expect(cp.description).toBe('Must be within 5% tolerance');
      expect(cp.riskLevel).toBe('High');
      expect(cp.failureImpactType).toBe('Safety');
      expect(cp.kpiThreshold).toBe(95);
      expect(cp.escalationRequired).toBe(true);
      expect(cp.evidenceType).toBe('Log');
    });

    it('emits a ControlPointCreatedEvent', () => {
      const cp = ControlPoint.create(baseProps);
      const events = cp.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].aggregateId).toBe(cp.id);
      expect(events[0].tenantId).toBe('tenant-1');
    });

    it('optional fields default to undefined', () => {
      const cp = ControlPoint.create(baseProps);
      expect(cp.description).toBeUndefined();
      expect(cp.kpiThreshold).toBeUndefined();
    });
  });

  describe('reconstitute()', () => {
    it('restores props without emitting events', () => {
      const cp = ControlPoint.reconstitute({ ...baseProps, id: 'cp-77' });
      expect(cp.id).toBe('cp-77');
      expect(cp.domainEvents).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('mutates provided fields and emits an updated event', () => {
      const cp = ControlPoint.create(baseProps);
      cp.clearDomainEvents();

      cp.update({ name: 'Updated CP', riskLevel: 'Critical', escalationRequired: false });

      expect(cp.name).toBe('Updated CP');
      expect(cp.riskLevel).toBe('Critical');
      expect(cp.escalationRequired).toBe(false);
      expect(cp.failureImpactType).toBe('Safety');
      expect(cp.domainEvents).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const cp = ControlPoint.create(baseProps);
      cp.clearDomainEvents();
      cp.update({ evidenceType: 'Email' });
      expect(cp.riskLevel).toBe('High');
      expect(cp.escalationRequired).toBe(true);
    });
  });

  describe('delete()', () => {
    it('emits a deleted event', () => {
      const cp = ControlPoint.create(baseProps);
      cp.clearDomainEvents();
      cp.delete();
      expect(cp.domainEvents).toHaveLength(1);
    });
  });

  describe('clearDomainEvents()', () => {
    it('removes all pending events', () => {
      const cp = ControlPoint.create(baseProps);
      cp.clearDomainEvents();
      expect(cp.domainEvents).toHaveLength(0);
    });
  });
});
