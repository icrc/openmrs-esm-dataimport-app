import { useCallback, useState } from 'react';
import { openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';

/**
 * Response from the backend form file upload API
 */
export interface FormFileUploadResponse {
  success: boolean;
  fileCount: number;
  fileIds: string[];
  files: Array<{
    filename: string;
    detectedType: string;
    size: string;
  }>;
  message: string;
}

/**
 * Uploaded form file metadata for UI display
 */
export interface UploadedFormFile {
  fileId: string;
  filename: string;
  detectedType: string;
  sizeBytes: number;
}

/**
 * Hook for uploading form files (JSON/XML) to the backend
 * Returns file IDs that can be used in template generation
 */
export function useFormFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFormFile[]>([]);

  const uploadFormFiles = useCallback(async (files: File[]): Promise<UploadedFormFile[]> => {
    if (files.length === 0) {
      showSnackbar({
        title: 'No files selected',
        subtitle: 'Please select at least one form file to upload',
        kind: 'warning',
      });
      return [];
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const url = `${restBaseUrl}/dataimport/forms/upload`;
      const response = await openmrsFetch<FormFileUploadResponse>(url, {
        method: 'POST',
        body: formData,
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Transform backend response to UI-friendly format
      const uploadedFormFiles: UploadedFormFile[] = data.fileIds.map((fileId, index) => ({
        fileId,
        filename: data.files[index].filename,
        detectedType: data.files[index].detectedType,
        sizeBytes: parseInt(data.files[index].size),
      }));

      setUploadedFiles(uploadedFormFiles);

      showSnackbar({
        title: 'Forms uploaded successfully',
        subtitle: `${data.fileCount} form file(s) uploaded and ready for template generation`,
        kind: 'success',
      });

      return uploadedFormFiles;
    } catch (e) {
      const error = e as Error;
      setUploadError(error);
      showSnackbar({
        title: 'Upload failed',
        subtitle: error.message || 'Failed to upload form files',
        kind: 'error',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadError(null);
  }, []);

  const removeUploadedFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    },
    [],
  );

  return {
    uploadFormFiles,
    isUploading,
    uploadError,
    uploadedFiles,
    clearUploadedFiles,
    removeUploadedFile,
  };
}
