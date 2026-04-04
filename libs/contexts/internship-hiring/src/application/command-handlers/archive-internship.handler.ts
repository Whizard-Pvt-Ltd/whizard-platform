import type { IInternshipRepository } from '../../domain/repositories/internship.repository.js';
import type { ArchiveInternshipCommand } from '../commands/archive-internship.command.js';
import type { InternshipDetailDto } from '../dto/internship.dto.js';
import { InternshipNotFoundException } from '../../domain/exceptions/internship-not-found.exception.js';
import { toInternshipDetailDto } from '../mappers/internship.mapper.js';

export class ArchiveInternshipCommandHandler {
  constructor(private readonly repo: IInternshipRepository) {}

  async execute(cmd: ArchiveInternshipCommand): Promise<InternshipDetailDto> {
    const internship = await this.repo.findById(cmd.id);
    if (!internship) throw new InternshipNotFoundException(cmd.id);

    internship.archive();
    await this.repo.save(internship);
    const saved = await this.repo.findById(cmd.id);
    return toInternshipDetailDto(saved!, null);
  }
}
