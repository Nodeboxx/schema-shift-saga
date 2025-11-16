export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  reason: string;
}

export interface ImportSummary {
  dosageForms: ImportResult;
  drugClasses: ImportResult;
  manufacturers: ImportResult;
  generics: ImportResult;
  medicines: ImportResult;
  totalDuration: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
}
