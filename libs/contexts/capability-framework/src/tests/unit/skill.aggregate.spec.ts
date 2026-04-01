import { describe, it, expect } from 'vitest';
import { Skill } from '../../domain/aggregates/skill.aggregate';

const baseProps = {
  tenantId: 'tenant-1',
  capabilityInstanceId: 'ci-1',
  name: 'Valve Inspection',
  cognitiveType: 'Procedural',
  skillCriticality: 'High',
  recertificationCycleMonths: 6,
  aiImpact: 'Medium'
};

describe('Skill aggregate', () => {
  describe('create()', () => {
    it('assigns a uuid id', () => {
      const skill = Skill.create(baseProps);
      expect(skill.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('copies all props correctly', () => {
      const skill = Skill.create(baseProps);
      expect(skill.tenantId).toBe('tenant-1');
      expect(skill.capabilityInstanceId).toBe('ci-1');
      expect(skill.name).toBe('Valve Inspection');
      expect(skill.cognitiveType).toBe('Procedural');
      expect(skill.skillCriticality).toBe('High');
      expect(skill.recertificationCycleMonths).toBe(6);
      expect(skill.aiImpact).toBe('Medium');
    });

    it('emits a SkillCreatedEvent', () => {
      const skill = Skill.create(baseProps);
      const events = skill.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].aggregateId).toBe(skill.id);
      expect(events[0].tenantId).toBe('tenant-1');
    });
  });

  describe('reconstitute()', () => {
    it('restores props without emitting events', () => {
      const skill = Skill.reconstitute({ ...baseProps, id: 'skill-42' });
      expect(skill.id).toBe('skill-42');
      expect(skill.domainEvents).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('mutates provided fields and emits an updated event', () => {
      const skill = Skill.create(baseProps);
      skill.clearDomainEvents();

      skill.update({ name: 'Updated Name', recertificationCycleMonths: 12 });

      expect(skill.name).toBe('Updated Name');
      expect(skill.recertificationCycleMonths).toBe(12);
      expect(skill.cognitiveType).toBe('Procedural');
      const events = skill.domainEvents;
      expect(events).toHaveLength(1);
    });

    it('leaves unspecified fields unchanged', () => {
      const skill = Skill.create(baseProps);
      skill.clearDomainEvents();
      skill.update({ aiImpact: 'High' });
      expect(skill.skillCriticality).toBe('High');
      expect(skill.cognitiveType).toBe('Procedural');
    });
  });

  describe('delete()', () => {
    it('emits a deleted event', () => {
      const skill = Skill.create(baseProps);
      skill.clearDomainEvents();
      skill.delete();
      expect(skill.domainEvents).toHaveLength(1);
    });
  });

  describe('clearDomainEvents()', () => {
    it('removes all pending events', () => {
      const skill = Skill.create(baseProps);
      expect(skill.domainEvents).toHaveLength(1);
      skill.clearDomainEvents();
      expect(skill.domainEvents).toHaveLength(0);
    });
  });
});
