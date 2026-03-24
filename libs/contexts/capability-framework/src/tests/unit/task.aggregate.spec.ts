import { describe, it, expect } from 'vitest';
import { Task } from '../../domain/aggregates/task.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  skillId: 'skill-1',
  name: 'Check pressure gauge',
  frequency: 'Daily',
  complexity: 'Medium'
};

describe('Task aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const task = Task.create(baseProps);
      expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const task = Task.create({
        ...baseProps,
        description: 'Desc',
        standardDuration: 30,
        requiredProficiencyLevel: 2
      });
      expect(task.tenantId).toBe('tenant-1');
      expect(task.skillId).toBe('skill-1');
      expect(task.name).toBe('Check pressure gauge');
      expect(task.description).toBe('Desc');
      expect(task.frequency).toBe('Daily');
      expect(task.complexity).toBe('Medium');
      expect(task.standardDuration).toBe(30);
      expect(task.requiredProficiencyLevel).toBe(2);
    });

    it('emits a TaskCreatedEvent', () => {
      const task = Task.create(baseProps);
      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].aggregateId).toBe(task.id);
      expect(events[0].tenantId).toBe('tenant-1');
    });

    it('optional fields default to undefined', () => {
      const task = Task.create(baseProps);
      expect(task.description).toBeUndefined();
      expect(task.standardDuration).toBeUndefined();
      expect(task.requiredProficiencyLevel).toBeUndefined();
    });
  });

  describe('reconstitute()', () => {
    it('restores props without emitting events', () => {
      const task = Task.reconstitute({ ...baseProps, id: 'task-99' });
      expect(task.id).toBe('task-99');
      expect(task.domainEvents).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('mutates provided fields and emits an updated event', () => {
      const task = Task.create(baseProps);
      task.clearDomainEvents();

      task.update({ name: 'Renamed Task', frequency: 'Weekly', standardDuration: 45 });

      expect(task.name).toBe('Renamed Task');
      expect(task.frequency).toBe('Weekly');
      expect(task.standardDuration).toBe(45);
      expect(task.complexity).toBe('Medium');
      expect(task.domainEvents).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const task = Task.create(baseProps);
      task.clearDomainEvents();
      task.update({ complexity: 'High' });
      expect(task.frequency).toBe('Daily');
      expect(task.name).toBe('Check pressure gauge');
    });
  });

  describe('delete()', () => {
    it('emits a deleted event', () => {
      const task = Task.create(baseProps);
      task.clearDomainEvents();
      task.delete();
      expect(task.domainEvents).toHaveLength(1);
    });
  });

  describe('clearDomainEvents()', () => {
    it('removes all pending events', () => {
      const task = Task.create(baseProps);
      task.clearDomainEvents();
      expect(task.domainEvents).toHaveLength(0);
    });
  });
});
