import type { DecisionEffect } from '../shared/transport-enums';

export interface EvaluateAccessDecisionResponseV1 {
  effect: DecisionEffect;
  reason?: string;
}
