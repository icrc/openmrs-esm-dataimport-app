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
    patientsToCreate?: number;
    existingPatientsReferenced?: number;
    blockedPatients?: number;
    encountersToCreate?: number;
    obsToCreate?: number;
    sheetSummaries?: SheetSummary[];
  };
  issues: QuarantineItem[];
  templateMeta: TemplateMeta;
  preview?: PreviewSummary;
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
    patientsToCreate?: number;
    existingPatientsReferenced?: number;
    blockedPatients?: number;
    encountersToCreate?: number;
    obsToCreate?: number;
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
    okRows?: number;
    quarantinedRows?: number;
    patientsToCreate?: number;
    existingPatientsReferenced?: number;
    blockedPatients?: number;
    encountersToCreate?: number;
    obsToCreate?: number;
    sheetSummaries?: SheetSummary[];
  };
  okRows?: any[];
  quarantinedRows?: QuarantineItem[];
  message: string;
  preview?: PreviewSummary;
}

export interface BackendCommitResponse {
  success: boolean;
  message: string;
  batchId: string;
  stats?: {
    totalProcessed: number;
    okRows?: number;
    quarantinedRows?: number;
    patientsToCreate?: number;
    existingPatientsReferenced?: number;
    blockedPatients?: number;
    encountersToCreate?: number;
    obsToCreate?: number;
    sheetSummaries?: SheetSummary[];
  };
  createdEncounterUuids?: string[];
  errors?: (string | CommitError)[];
}

export interface SheetSummary {
  sheetName: string;
  okRows: number;
  quarantinedRows: number;
}

export interface PreviewSummary {
  totals?: {
    totalRows: number;
    okRows: number;
    quarantinedRows: number;
  };
  patients?: {
    new: number;
    existing: number;
    blocked: number;
    blockedRefs?: string[];
  };
  encounters?: {
    encountersToCreate: number;
    obsToCreate: number;
  };
  sheets?: SheetSummary[];
}

export interface CommitError {
  patientRef?: string;
  message: string;
  encounterUuid?: string;
}
