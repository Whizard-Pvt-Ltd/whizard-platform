import type { ActivateUserAccountRequestDto } from '../dto/requests/activate-user-account.request.dto';

export interface ActivateUserAccountCommand {
  readonly request: ActivateUserAccountRequestDto;
}
