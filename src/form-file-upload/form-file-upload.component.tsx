import React, { useCallback, useRef, useState } from 'react';
import { Button, InlineLoading, Tag, Tile } from '@carbon/react';
import { DocumentAdd, Upload, Close } from '@carbon/react/icons';
import { useFormFileUpload, type UploadedFormFile } from '../hooks/useFormFileUpload';
import styles from './form-file-upload.scss';

interface FormFileUploadProps {
  onFilesUploaded?: (files: UploadedFormFile[]) => void;
  disabled?: boolean;
  className?: string;
}

const SUPPORTED_FORM_FILE_TYPES = ['.json', '.xml'];
const MAX_FILE_SIZE_MB = 10;

export const FormFileUpload: React.FC<FormFileUploadProps> = ({ onFilesUploaded, disabled = false, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFormFiles, isUploading, uploadedFiles, removeUploadedFile } = useFormFileUpload();

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      // Check file extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_FORM_FILE_TYPES.includes(extension)) {
        console.warn(`Skipping unsupported file: ${file.name}`);
        continue;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        console.warn(`Skipping file too large: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const validFiles = validateFiles(files);
        setSelectedFiles(validFiles);
      }
    },
    [validateFiles],
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const validFiles = validateFiles(files);
        setSelectedFiles(validFiles);
      }
    },
    [disabled, validateFiles],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveUploadedFile = useCallback(
    (fileId: string) => {
      removeUploadedFile(fileId);
    },
    [removeUploadedFile],
  );

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      const uploaded = await uploadFormFiles(selectedFiles);
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onFilesUploaded?.(uploaded);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [selectedFiles, uploadFormFiles, onFilesUploaded]);

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'O3_JSON':
        return 'O3 Form (JSON)';
      case 'HFE_XML':
        return 'HFE Form (XML)';
      default:
        return type;
    }
  };

  return (
    <div className={`${styles.formFileUploadContainer} ${className || ''}`}>
      <Tile className={styles.uploadTile}>
        <div className={styles.uploadHeader}>
          <h4>Upload Form Files</h4>
          <p className={styles.uploadDescription}>
            Upload O3 JSON or HFE XML form files from your computer to use in template generation.
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_FORM_FILE_TYPES.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {/* Drag and drop zone */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={32} className={styles.uploadIcon} />
          <p className={styles.dropZoneText}>
            Drag and drop form files here, or{' '}
            <button type="button" className={styles.browseButton} onClick={handleBrowseClick} disabled={disabled}>
              browse
            </button>
          </p>
          <p className={styles.dropZoneHint}>
            Supports: {SUPPORTED_FORM_FILE_TYPES.join(', ')} (max {MAX_FILE_SIZE_MB} MB per file)
          </p>
        </div>

        {/* Selected files (before upload) */}
        {selectedFiles.length > 0 && (
          <div className={styles.selectedFilesSection}>
            <h5>Selected Files ({selectedFiles.length})</h5>
            <div className={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <Tag key={index} filter type="blue" onClose={() => handleRemoveFile(index)} className={styles.fileTag}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Tag>
              ))}
            </div>
            <Button
              kind="primary"
              size="md"
              onClick={handleUpload}
              disabled={isUploading || disabled}
              renderIcon={DocumentAdd}
              className={styles.uploadButton}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </Button>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className={styles.uploadingStatus}>
            <InlineLoading description="Uploading form files..." />
          </div>
        )}

        {/* Uploaded files (after successful upload) */}
        {uploadedFiles.length > 0 && (
          <div className={styles.uploadedFilesSection}>
            <h5>Uploaded Forms ({uploadedFiles.length})</h5>
            <p className={styles.uploadedHint}>
              These files are now available for template generation. They will be removed when the server restarts.
            </p>
            <div className={styles.fileList}>
              {uploadedFiles.map((file) => (
                <Tag
                  key={file.fileId}
                  filter
                  type="green"
                  onClose={() => handleRemoveUploadedFile(file.fileId)}
                  className={styles.fileTag}
                >
                  <span className={styles.uploadedFileInfo}>
                    <strong>{file.filename}</strong>
                    <span className={styles.fileType}>{getFormTypeLabel(file.detectedType)}</span>
                  </span>
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Tile>
    </div>
  );
};
