import type { AcceptInvitationRequestDto } from '../dto/requests/accept-invitation.request.dto';

export interface AcceptInvitationCommand {
  readonly request: AcceptInvitationRequestDto;
}
