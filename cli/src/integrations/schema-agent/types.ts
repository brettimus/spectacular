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

export interface DatabaseTable {
  name: string;
  description: string;
  fields: TableField[];
}

export interface SelectedRule {
  ruleName: string;
  priority: number;
  reason: string;
}
