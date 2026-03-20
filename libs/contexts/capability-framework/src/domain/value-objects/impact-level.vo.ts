export interface ImpactLevelValue {
  label: string;
  value: number;
}

export const CRITICALITY_LEVELS: readonly ImpactLevelValue[] = [
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.6 },
  { label: 'High', value: 0.8 },
];

export const COMPLEXITY_LEVELS: readonly ImpactLevelValue[] = [
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.6 },
  { label: 'High', value: 0.9 },
];

export const FREQUENCY_LEVELS: readonly ImpactLevelValue[] = CRITICALITY_LEVELS;

export const resolveImpactLevel = (
  label: string,
  config: readonly ImpactLevelValue[]
): ImpactLevelValue => {
  const found = config.find(l => l.label.toLowerCase() === label.toLowerCase());
  if (!found) throw new Error(`Unknown impact level label: "${label}"`);
  return found;
};
