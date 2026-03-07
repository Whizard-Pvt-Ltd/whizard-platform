import type { EvaluateAccessDecisionRequestDto } from '../dto/requests/evaluate-access-decision.request.dto';

export interface EvaluateAccessDecisionCommand {
  readonly request: EvaluateAccessDecisionRequestDto;
}
