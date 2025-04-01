// Define interfaces for our data structures
export interface TableField {
  name: string;
  type: string;
  isPrimary: boolean;
  isRequired: boolean;
  isForeignKey: boolean;
  references?: string;
  description: string;
}

export interface SelectedRule {
  ruleName: string;
  reason: string;
}
