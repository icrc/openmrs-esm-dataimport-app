export const PRIVILEGE_MANAGE_DATA_IMPORT = 'Manage Data Import';

export const SUPPORTED_FILE_TYPES = ['.xlsx', '.xls', '.csv'];

export const LANGUAGES = [
  { value: 'en', text: 'English' },
  { value: 'fr', text: 'Français' },
  { value: 'es', text: 'Español' },
];

export const IMPORT_MODES = [
  { value: 'permissive', text: 'Permissive' },
  { value: 'strict', text: 'Strict' },
];

export const PATIENT_MATCH_POLICIES = [
  { value: 'none', text: 'None (create)' },
  { value: 'identifier-only', text: 'Identifier-only' },
  { value: 'soft', text: 'Soft (suggest)' },
];

export const REPEAT_OPTIONS = [
  { value: 'inline', text: 'Inline' },
  { value: 'separate', text: 'Separate sheets' },
];
