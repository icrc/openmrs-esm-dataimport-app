import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Grid,
  Column,
  Tile,
  Select,
  SelectItem,
  Toggle,
  FileUploader,
  Tag,
  InlineLoading
} from '@carbon/react';
import { ImportOptions } from './types';
import { SUPPORTED_FILE_TYPES, IMPORT_MODES, PATIENT_MATCH_POLICIES } from './constants';
import styles from './import-data.scss';

const ImportData: React.FC = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState('permissive');
  const [patientMatchPolicy, setPatientMatchPolicy] = useState('identifier-only');
  const [isIdempotent, setIsIdempotent] = useState(true);
  const [allowPatientUpdates, setAllowPatientUpdates] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleDryRun = async () => {
    setIsDryRunning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsDryRunning(false);
  };

  const handleImport = async () => {
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsImporting(false);
  };

  return (
    <div className={styles.importData}>
      <Grid className={styles.grid}>
        <Column lg={8} md={4} sm={4}>
          <Tile className={styles.sectionTile}>
            <h3 className={styles.sectionTitle}>{t('uploadFile', 'Upload File')}</h3>
            <FileUploader
              labelTitle={t('uploadFileLabel', 'Upload files')}
              labelDescription={t('uploadFileDescription', 'Choose files or drag and drop files here. Only .xlsx, .xls, and .csv files are supported.')}
              accept={SUPPORTED_FILE_TYPES}
              filenameStatus="edit"
              onChange={(event) => setUploadedFile(event.target.files?.[0] || null)}
              className={styles.fileUploader}
            />
            
            {uploadedFile && (
              <div className={styles.fileInfo}>
                <Tag type="green">
                  {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Tag>
              </div>
            )}
          </Tile>
        </Column>

        <Column lg={8} md={4} sm={4}>
          <Tile className={styles.sectionTile}>
            <h3 className={styles.sectionTitle}>{t('importOptions', 'Import Options')}</h3>
            
            <div className={styles.optionGroup}>
              <label htmlFor="importMode">{t('mode', 'Mode:')}</label>
              <Select id="importMode" defaultValue={importMode}>
                {IMPORT_MODES.map(mode => (
                  <SelectItem key={mode.value} value={mode.value} text={t(mode.value, mode.text)} />
                ))}
              </Select>
            </div>

            <div className={styles.optionGroup}>
              <label htmlFor="patientMatch">{t('patientMatchPolicy', 'Patient match policy:')}</label>
              <Select id="patientMatch" defaultValue={patientMatchPolicy}>
                {PATIENT_MATCH_POLICIES.map(policy => (
                  <SelectItem key={policy.value} value={policy.value} text={t(policy.value, policy.text)} />
                ))}
              </Select>
            </div>

            <div className={styles.optionGroup}>
              <Toggle
                id="idempotent"
                labelText={t('idempotent', 'Idempotent')}
                toggled={isIdempotent}
                onToggle={setIsIdempotent}
              />
              <Toggle
                id="allowPatientUpdates"
                labelText={t('allowPatientUpdates', 'Allow patient updates')}
                toggled={allowPatientUpdates}
                onToggle={setAllowPatientUpdates}
              />
            </div>

            <div className={styles.actionButtons}>
              <Button
                kind="secondary"
                disabled={!uploadedFile || isDryRunning}
                onClick={handleDryRun}
                className={styles.actionButton}
              >
                {isDryRunning ? (
                  <InlineLoading description={t('runningDryRun', 'Running dry run...')} />
                ) : (
                  t('dryRun', 'Dry Run')
                )}
              </Button>
              
              <Button
                disabled={!uploadedFile || isImporting}
                onClick={handleImport}
                className={styles.actionButton}
              >
                {isImporting ? (
                  <InlineLoading description={t('importing', 'Importing...')} />
                ) : (
                  t('importNow', 'Import Now')
                )}
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

export default ImportData;
