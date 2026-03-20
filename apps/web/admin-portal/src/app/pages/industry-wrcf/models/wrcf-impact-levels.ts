export interface ImpactLevelOption {
  label: string;
  value: number;
}

export const CRITICALITY_LEVELS: ImpactLevelOption[] = [
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.6 },
  { label: 'High', value: 0.8 },
];

export const COMPLEXITY_LEVELS: ImpactLevelOption[] = [
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.6 },
  { label: 'High', value: 0.9 },
];

export const FREQUENCY_LEVELS: ImpactLevelOption[] = CRITICALITY_LEVELS;
