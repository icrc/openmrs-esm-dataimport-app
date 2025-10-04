import { Type } from '@openmrs/esm-framework';

/**
 * Configuration schema for the data import application.
 * This can be extended as needed for specific configuration options.
 */
export const configSchema = {
  // Add configuration options here as needed
  // Example:
  // maxFileSize: {
  //   _type: Type.Number,
  //   _default: 10485760, // 10MB
  //   _description: 'Maximum file size for uploads in bytes.',
  // },
};

export type Config = {
  // Add config type definitions here as needed
  // Example:
  // maxFileSize: number;
};
