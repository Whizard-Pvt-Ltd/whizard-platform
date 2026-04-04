import type { UpdateInternshipDto } from '../dto/internship.dto.js';

export interface UpdateInternshipCommand extends UpdateInternshipDto {
  id: string;
}
