export interface CalculationStep {
  id: string;
  title: string;
  description: string;
  formula?: string;
  substitution?: string;
  calculation?: string;
  result?: string;
  note?: string;
}

export interface CalculationResult<T = number> {
  value: T;
  steps: CalculationStep[];
  formula: string;
  inputs: Record<string, number | string>;
}

export interface InputFieldConfig {
  name: string;
  label: string;
  type: 'number' | 'text';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  helpText?: string;
}

export interface CalculatorConfig {
  title: string;
  description: string;
  formula: string;
  inputs: InputFieldConfig[];
}
