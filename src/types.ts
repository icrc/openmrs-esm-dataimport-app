export interface Form {
  uuid: string;
  name: string;
  encounterType: string;
  version: string;
}

export interface TemplateOptions {
  includePatientRegistration: boolean;
  // filenamePattern: string;
}

export interface ImportOptions {
  mode: string;
  patientMatchPolicy: string;
  isIdempotent: boolean;
  allowPatientUpdates: boolean;
}
