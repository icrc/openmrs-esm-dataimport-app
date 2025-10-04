export interface Form {
  uuid: string;
  name: string;
  encounterType: string;
  version: string;
}

export interface TemplateOptions {
  includePatientRegistration: boolean;
  includeVisitSheet: boolean;
  includeLocationDetails: boolean;
  includeInstructions: boolean;
  language: string;
  includeRepeatsInline: boolean;
  includeCodedDropdowns: boolean;
  includeReadme: boolean;
  filenamePattern: string;
}

export interface ImportOptions {
  mode: string;
  patientMatchPolicy: string;
  isIdempotent: boolean;
  allowPatientUpdates: boolean;
}
