export const CAPABILITY_TYPES = ['Cognitive', 'Execution', 'Diagnostic'] as const;
export type CapabilityType = typeof CAPABILITY_TYPES[number];
