import type { CreateAccessPrincipalRequestDto } from '../dto/requests/create-access-principal.request.dto';

export interface CreateAccessPrincipalCommand {
  readonly request: CreateAccessPrincipalRequestDto;
}
