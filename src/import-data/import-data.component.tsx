import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Grid,
  Column,
  Tile,
  FileUploader,
  Tag,
  InlineLoading,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { showNotification, showSnackbar } from '@openmrs/esm-framework';
import type { DryRunResponse, CommitResponse } from '../types';
import { SUPPORTED_FILE_TYPES } from '../constants';
import { useImportData } from '../hooks/useImportData';
import Header from '../header/header.component';
import styles from './import-data.scss';

const ImportData: React.FC = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { performDryRun, commitImport, isDryRunning, isImporting, dryRunError, importError } = useImportData();
  const [currentStep, setCurrentStep] = useState<'upload' | 'validation' | 'commit' | 'complete'>('upload');
  const [dryRunResult, setDryRunResult] = useState<DryRunResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

  const handleDryRun = async () => {
    if (!uploadedFile) return;

    try {
      const result = await performDryRun(uploadedFile);
      setDryRunResult(result);
      setCurrentBatchId(result.batchId);
      setCurrentStep('validation');

      showSnackbar({
        title: 'Dry Run Complete',
        subtitle: `Found ${result.stats.okRows} valid rows and ${result.stats.quarantinedRows} issues`,
        kind: 'success',
      });
    } catch (error) {
      showSnackbar({
        title: 'Dry Run Failed',
        subtitle: (error as Error).message || 'An error occurred during dry run',
        kind: 'error',
      });
    }
  };

  const handleImport = async () => {
    if (!currentBatchId) return;

    try {
      const result = await commitImport(currentBatchId);
      setCommitResult(result);
      setCurrentStep('complete');

      if (result.summary.failed === 0) {
        showNotification({
          title: 'Import Complete',
          description: `Successfully imported ${result.summary.successful} rows`,
          kind: 'success',
        });
      } else {
        showNotification({
          title: 'Import Complete with Issues',
          description: `${result.summary.successful} rows imported, ${result.summary.failed} failed`,
          kind: 'warning',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Import Failed',
        description: (error as Error).message || 'An error occurred during import',
        kind: 'error',
        critical: true,
      });
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setDryRunResult(null);
    setCommitResult(null);
    setCurrentBatchId(null);
    setCurrentStep('upload');
  };

  const getIssueSeverity = (code: string): 'error' | 'warning' | 'info' => {
    if (code.includes('REQUIRED') || code.includes('INVALID')) return 'error';
    if (code.includes('FUTURE') || code.includes('TOO_LONG')) return 'warning';
    return 'info';
  };

  const getIssueColor = (severity: string): 'red' | 'green' | 'blue' => {
    switch (severity) {
      case 'error':
        return 'red';
      case 'warning':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <div className={styles.importData}>
      <div className="pageHeader">
        <Header title={t('excelDataImport', 'Excel Data Import')} />
      </div>

      <div className="mainContent">
        <div className={styles.progressSteps}>
          <div className={`${styles.step} ${currentStep === 'upload' ? styles.active : ''}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Upload File</span>
          </div>
          <div className={`${styles.step} ${currentStep === 'validation' ? styles.active : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>Validation</span>
          </div>
          <div className={`${styles.step} ${currentStep === 'commit' ? styles.active : ''}`}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepLabel}>Import</span>
          </div>
          <div className={`${styles.step} ${currentStep === 'complete' ? styles.active : ''}`}>
            <span className={styles.stepNumber}>4</span>
            <span className={styles.stepLabel}>Complete</span>
          </div>
        </div>

        <Grid className="componentGrid">
          {currentStep === 'upload' && (
            <Column lg={16} md={8} sm={4}>
              <Tile className={styles.sectionTile}>
                <h3 className={styles.sectionTitle}>{t('uploadFile', 'Upload File')}</h3>
                <FileUploader
                  labelTitle={t('uploadFileLabel', 'Upload files')}
                  labelDescription={t(
                    'uploadFileDescription',
                    'Choose files or drag and drop files here. Only .xlsx, .xls, and .csv files are supported.',
                  )}
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
                </div>
              </Tile>
            </Column>
          )}

          {currentStep === 'validation' && dryRunResult && (
            <Column lg={16} md={8} sm={4}>
              <Tile className={styles.sectionTile}>
                <h3 className={styles.sectionTitle}>Validation Results</h3>

                <div className={styles.statsSummary}>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Total Rows:</span>
                      <span className={styles.statValue}>{dryRunResult.stats.totalRows}</span>
                    </div>
                    <div className={`${styles.statItem} ${styles.success}`}>
                      <span className={styles.statLabel}>Valid Rows:</span>
                      <span className={styles.statValue}>{dryRunResult.stats.okRows}</span>
                    </div>
                    <div className={`${styles.statItem} ${styles.warning}`}>
                      <span className={styles.statLabel}>Quarantined Rows:</span>
                      <span className={styles.statValue}>{dryRunResult.stats.quarantinedRows}</span>
                    </div>
                    <div className={`${styles.statItem} ${styles.error}`}>
                      <span className={styles.statLabel}>Error Rows:</span>
                      <span className={styles.statValue}>{dryRunResult.stats.errorRows}</span>
                    </div>
                  </div>
                </div>

                {dryRunResult.issues.length > 0 && (
                  <div className={styles.validationIssues}>
                    <h4>Validation Issues</h4>
                    <DataTable
                      rows={dryRunResult.issues.map((issue, index) => ({
                        id: index.toString(),
                        sheet: issue.sheet,
                        row: issue.row,
                        column: issue.column,
                        code: issue.code,
                        message: issue.message,
                        hints: issue.hints?.join(', ') || '',
                        severity: getIssueSeverity(issue.code),
                      }))}
                      headers={[
                        { key: 'sheet', header: 'Sheet' },
                        { key: 'row', header: 'Row' },
                        { key: 'column', header: 'Column' },
                        { key: 'code', header: 'Error Code' },
                        { key: 'message', header: 'Message' },
                        { key: 'hints', header: 'Suggestions' },
                      ]}
                    >
                      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                        <TableContainer>
                          <Table {...getTableProps()}>
                            <TableHead>
                              <TableRow>
                                {headers.map((header) => (
                                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                    {header.header}
                                  </TableHeader>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row) => (
                                <TableRow key={row.id} {...getRowProps({ row })}>
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>
                                      {cell.info.header === 'code' ? (
                                        <Tag type={getIssueColor((row as any).severity)}>{cell.value}</Tag>
                                      ) : (
                                        cell.value
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DataTable>
                  </div>
                )}

                <div className={styles.templateInfo}>
                  <h4>Template Information</h4>
                  <div className={styles.templateDetails}>
                    <p>
                      <strong>Template Name:</strong> {dryRunResult.templateMeta.templateName}
                    </p>
                    <p>
                      <strong>Forms Included:</strong> {dryRunResult.templateMeta.formCount}
                    </p>
                    <div className={styles.formsList}>
                      {dryRunResult.templateMeta.forms.map((form, index) => (
                        <Tag key={index} type="blue">
                          {form.formName} v{form.formVersion}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <Button kind="secondary" onClick={handleReset} className={styles.actionButton}>
                    Upload Different File
                  </Button>
                  <Button
                    disabled={dryRunResult.stats.okRows === 0}
                    onClick={() => setCurrentStep('commit')}
                    className={styles.actionButton}
                  >
                    Proceed to Import ({dryRunResult.stats.okRows} rows)
                  </Button>
                </div>
              </Tile>
            </Column>
          )}

          {currentStep === 'commit' && (
            <Column lg={16} md={8} sm={4}>
              <Tile className={styles.sectionTile}>
                <h3 className={styles.sectionTitle}>Import Confirmation</h3>

                {dryRunResult && (
                  <div className={styles.commitSummary}>
                    <p>
                      Ready to import <strong>{dryRunResult.stats.okRows}</strong> valid rows.
                    </p>
                    {dryRunResult.stats.quarantinedRows > 0 && (
                      <p className={styles.warningText}>
                        <strong>{dryRunResult.stats.quarantinedRows}</strong> rows will be skipped due to validation
                        issues.
                      </p>
                    )}

                    <div className={styles.actionButtons}>
                      <Button
                        kind="secondary"
                        onClick={() => setCurrentStep('validation')}
                        className={styles.actionButton}
                      >
                        Back to Validation
                      </Button>
                      <Button disabled={isImporting} onClick={handleImport} className={styles.actionButton}>
                        {isImporting ? <InlineLoading description="Importing..." /> : 'Start Import'}
                      </Button>
                    </div>
                  </div>
                )}
              </Tile>
            </Column>
          )}

          {currentStep === 'complete' && commitResult && (
            <Column lg={16} md={8} sm={4}>
              <Tile className={styles.sectionTile}>
                <h3 className={styles.sectionTitle}>Import Complete</h3>

                <div className={styles.importResults}>
                  <div className={styles.resultsSummary}>
                    <h4>Import Summary</h4>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Processed:</span>
                        <span className={styles.statValue}>{commitResult.summary.totalProcessed}</span>
                      </div>
                      <div className={`${styles.statItem} ${styles.success}`}>
                        <span className={styles.statLabel}>Successful:</span>
                        <span className={styles.statValue}>{commitResult.summary.successful}</span>
                      </div>
                      <div className={`${styles.statItem} ${styles.error}`}>
                        <span className={styles.statLabel}>Failed:</span>
                        <span className={styles.statValue}>{commitResult.summary.failed}</span>
                      </div>
                    </div>
                  </div>

                  {commitResult.results.length > 0 && (
                    <div className={styles.resultsDetails}>
                      <h4>Import Details</h4>
                      <DataTable
                        rows={commitResult.results.map((result, index) => ({
                          id: index.toString(),
                          patientRef: result.patientRef,
                          status: result.status,
                          encounterUuid: result.encounterUuid || '',
                          message: result.message,
                        }))}
                        headers={[
                          { key: 'patientRef', header: 'Patient Ref' },
                          { key: 'status', header: 'Status' },
                          { key: 'encounterUuid', header: 'Encounter UUID' },
                          { key: 'message', header: 'Message' },
                        ]}
                      >
                        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                          <TableContainer>
                            <Table {...getTableProps()}>
                              <TableHead>
                                <TableRow>
                                  {headers.map((header) => (
                                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                      {header.header}
                                    </TableHeader>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {rows.map((row) => (
                                  <TableRow key={row.id} {...getRowProps({ row })}>
                                    {row.cells.map((cell) => (
                                      <TableCell key={cell.id}>
                                        {cell.info.header === 'status' ? (
                                          <Tag type={cell.value === 'SUCCESS' ? 'green' : 'red'}>{cell.value}</Tag>
                                        ) : (
                                          cell.value
                                        )}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </DataTable>
                    </div>
                  )}

                  <div className={styles.actionButtons}>
                    <Button onClick={handleReset} className={styles.actionButton}>
                      Import Another File
                    </Button>
                  </div>
                </div>
              </Tile>
            </Column>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default ImportData;
