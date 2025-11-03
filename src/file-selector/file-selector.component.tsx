import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { DocumentAdd } from '@carbon/react/icons';
import styles from './file-selector.scss';

interface FileSelectorProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onRemoveFile?: () => void;
  disabled?: boolean;
  supportedFileTypes?: string[];
  buttonText?: string;
  className?: string;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  disabled = false,
  supportedFileTypes = ['.xlsx', '.xls', '.csv'],
  buttonText,
  className,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (onRemoveFile) {
      onRemoveFile();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFileTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Button
        kind="secondary"
        onClick={handleFileButtonClick}
        className={`${styles.selectButton} ${className || ''}`}
        disabled={disabled}
        renderIcon={DocumentAdd}
      >
        {buttonText || t('selectFile', 'Select File')}
      </Button>
    </>
  );
};

export default FileSelector;
