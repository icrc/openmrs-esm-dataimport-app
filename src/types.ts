export interface Form {
  uuid: string;
  name: string;
  encounterType: string;
  version: string;
}

export interface TemplateOptions {
  includePatientRegistration: boolean;
  // filenamePattern: string;
  locationUuid?: string;
  filename?: string;
}

export interface ImportOptions {
  mode: string;
  patientMatchPolicy: string;
  isIdempotent: boolean;
  allowPatientUpdates: boolean;
}

export interface DryRunResponse {
  batchId: string;
  stats: {
    totalRows: number;
    okRows: number;
    quarantinedRows: number;
    errorRows: number;
  };
  issues: QuarantineItem[];
  templateMeta: TemplateMeta;
}

export interface QuarantineItem {
  sheet: string;
  row: number;
  column: number;
  code: string;
  message: string;
  hints?: string[];
}

export interface TemplateMeta {
  templateName: string;
  defaultLocationUuid: string;
  formCount: number;
  forms: FormInfo[];
}

export interface FormInfo {
  formUuid: string;
  formName: string;
  formVersion: string;
  encounterTypeUuid: string;
  sheetName: string;
}

export interface CommitResponse {
  batchId: string;
  results: RowResult[];
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
  };
}

export interface RowResult {
  patientRef: string;
  status: 'SUCCESS' | 'ERROR';
  encounterUuid?: string;
  message: string;
}

// Backend response interfaces (what the API actually returns)
export interface BackendDryRunResponse {
  success: boolean;
  batchId: string;
  stats?: {
    totalRows: number;
  };
  okRows?: any[];
  quarantinedRows?: any[];
  message: string;
}

export interface BackendCommitResponse {
  success: boolean;
  message: string;
  batchId: string;
  stats?: {
    totalProcessed: number;
  };
  createdEncounterUuids?: string[];
  errors?: string[];
}
