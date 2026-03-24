import { Skill } from '../../domain/aggregates/skill.aggregate';
import type { ISkillRepository } from '../../domain/repositories/skill.repository';
import type { CreateSkillCommand, UpdateSkillCommand, DeleteSkillCommand } from '../commands/skill.commands';
import { DomainException } from '../domain-exception';

export class CreateSkillCommandHandler {
  constructor(private readonly repo: ISkillRepository) {}

  async execute(cmd: CreateSkillCommand): Promise<void> {
    const skill = Skill.create({
      tenantId: cmd.tenantId,
      ciId: cmd.ciId,
      name: cmd.name,
      description: cmd.description,
      cognitiveType: cmd.cognitiveType,
      skillCriticality: cmd.skillCriticality,
      recertificationCycle: cmd.recertificationCycle,
      aiImpact: cmd.aiImpact
    });
    await this.repo.save(skill);
  }
}

export class UpdateSkillCommandHandler {
  constructor(private readonly repo: ISkillRepository) {}

  async execute(cmd: UpdateSkillCommand): Promise<void> {
    const skill = await this.repo.findById(cmd.id);
    if (!skill) throw new DomainException(`Skill ${cmd.id} not found`);
    skill.update({
      name: cmd.name,
      description: cmd.description,
      cognitiveType: cmd.cognitiveType,
      skillCriticality: cmd.skillCriticality,
      recertificationCycle: cmd.recertificationCycle,
      aiImpact: cmd.aiImpact
    });
    await this.repo.update(skill);
  }
}

export class DeleteSkillCommandHandler {
  constructor(private readonly repo: ISkillRepository) {}

  async execute(cmd: DeleteSkillCommand): Promise<void> {
    const skill = await this.repo.findById(cmd.id);
    if (!skill) throw new DomainException(`Skill ${cmd.id} not found`);
    skill.delete();
    await this.repo.delete(cmd.id);
  }
}
