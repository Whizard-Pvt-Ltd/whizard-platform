export interface ProficiencyProps {
  id: string;
  level: number;
  label: string;
  description?: string;
  independenceLevel?: string;
}

export class Proficiency {
  readonly id: string;
  readonly level: number;
  readonly label: string;
  readonly description?: string;
  readonly independenceLevel?: string;

  constructor(props: ProficiencyProps) {
    this.id = props.id;
    this.level = props.level;
    this.label = props.label;
    this.description = props.description;
    this.independenceLevel = props.independenceLevel;
  }
}
