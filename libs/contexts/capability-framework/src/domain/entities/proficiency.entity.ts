export interface ProficiencyProps {
  id: string;
  level: string;
  label: string;
  description?: string;
  weightage?: number;
  isActive: boolean;
}

export class Proficiency {
  readonly id: string;
  readonly level: string;
  readonly label: string;
  readonly description?: string;
  readonly weightage?: number;
  readonly isActive: boolean;

  constructor(props: ProficiencyProps) {
    this.id = props.id;
    this.level = props.level;
    this.label = props.label;
    this.description = props.description;
    this.weightage = props.weightage;
    this.isActive = props.isActive;
  }
}
