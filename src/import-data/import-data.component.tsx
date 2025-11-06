import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Grid,
  Column,
  Tile,
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
import { Download } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import type { DryRunResponse, CommitResponse } from '../types';
import { SUPPORTED_FILE_TYPES } from '../constants';
import { useImportData } from '../hooks/useImportData';
import Header from '../header/header.component';
import FileSelector from '../file-selector/file-selector.component';
import styles from './import-data.scss';

const ImportData: React.FC = () => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { performDryRun, commitImport, downloadQuarantineReport, isDryRunning, isImporting, dryRunError, importError } =
    useImportData();
  const [dryRunResult, setDryRunResult] = useState<DryRunResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [importStarted, setImportStarted] = useState(false);

  const handleDryRun = async () => {
    if (!uploadedFile) return;

    try {
      const result = await performDryRun(uploadedFile);
      setDryRunResult(result);
      setCurrentBatchId(result.batchId);

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

    setImportStarted(true);
    try {
      const result = await commitImport(currentBatchId);
      setCommitResult(result);

      if (result.summary.failed === 0) {
        showSnackbar({
          title: 'Import Complete',
          subtitle: `Successfully imported ${result.summary.successful} rows`,
          kind: 'success',
        });
      } else {
        showSnackbar({
          title: 'Import Complete with Issues',
          subtitle: `${result.summary.successful} rows imported, ${result.summary.failed} failed`,
          kind: 'warning',
        });
      }
    } catch (error) {
      showSnackbar({
        title: 'Import Failed',
        subtitle: (error as Error).message || 'An error occurred during import',
        kind: 'error',
      });
    }
  };

  const handleDownloadQuarantineReport = async () => {
    if (!uploadedFile || !currentBatchId) return;

    try {
      await downloadQuarantineReport(uploadedFile, currentBatchId);
      showSnackbar({
        title: 'Download Complete',
        subtitle: 'Quarantine report downloaded successfully',
        kind: 'success',
      });
    } catch (error) {
      showSnackbar({
        title: 'Download Failed',
        subtitle: (error as Error).message || 'An error occurred during download',
        kind: 'error',
      });
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setDryRunResult(null);
    setCommitResult(null);
    setCurrentBatchId(null);
    setImportStarted(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setDryRunResult(null);
    setCommitResult(null);
    setCurrentBatchId(null);
    setImportStarted(false);
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
        <Grid className="componentGrid">
          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('uploadFile', 'Upload File')}</h3>
              <p className={styles.instructions}>
                {t(
                  'uploadInstructions',
                  'Click "Select File" to choose an Excel to import. Once selected, click "Run Validation" to validate your data before importing.',
                )}
              </p>
              <p className={styles.fileFormatNote}>
                <strong>{t('supportedFormats', 'Supported file formats')}:</strong>{' '}
                {t('supportedFormatsList', 'Excel (.xlsx, .xls) files.')}
              </p>

              {uploadedFile && (
                <div className={styles.fileInfo}>
                  <Tag
                    filter
                    type="gray"
                    onClose={handleRemoveFile}
                    style={{ backgroundColor: 'var(--brand-teal)', color: 'white' }}
                  >
                    {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Tag>
                </div>
              )}

              <div className={styles.actionButtons}>
                <FileSelector
                  selectedFile={uploadedFile}
                  onFileSelect={setUploadedFile}
                  onRemoveFile={handleRemoveFile}
                  disabled={importStarted}
                  supportedFileTypes={SUPPORTED_FILE_TYPES}
                />

                <Button
                  kind="primary"
                  disabled={!uploadedFile || isDryRunning || importStarted}
                  onClick={handleDryRun}
                  className={styles.actionButton}
                >
                  {isDryRunning ? (
                    <InlineLoading description={t('runningDryRun', 'Running dry run...')} />
                  ) : (
                    t('dryRun', 'Run Validation')
                  )}
                </Button>
              </div>
            </Tile>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('validationResults', 'Validation Results')}</h3>

              {dryRunResult ? (
                <>
                  <div className={styles.statsSummary}>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>{t('totalRows', 'Total Rows')}:</span>
                        <span className={styles.statValue}>{dryRunResult.stats.totalRows}</span>
                      </div>
                      <div className={`${styles.statItem} ${styles.success}`}>
                        <span className={styles.statLabel}>{t('validRows', 'Valid Rows')}:</span>
                        <span className={styles.statValue}>{dryRunResult.stats.okRows}</span>
                      </div>
                      <div className={`${styles.statItem} ${styles.warning}`}>
                        <span className={styles.statLabel}>{t('quarantinedRows', 'Quarantined Rows')}:</span>
                        <span className={styles.statValue}>{dryRunResult.stats.quarantinedRows}</span>
                      </div>
                    </div>
                  </div>

                  {dryRunResult.issues.length > 0 && (
                    <div className={styles.validationIssues}>
                      <h4>{t('validationIssues', 'Validation Issues')}</h4>
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

                      <div className={styles.quarantineInfo}>
                        <p className={styles.infoText}>
                          {t(
                            'quarantineReportInfo',
                            'The quarantine report contains all rows with validation errors. Download it to review and fix issues, then re-upload the corrected file.',
                          )}
                        </p>
                      </div>
                      <div className={styles.actionButtons}>
                        <Button
                          kind="secondary"
                          onClick={handleDownloadQuarantineReport}
                          className={styles.downloadButton}
                          renderIcon={Download}
                        >
                          {t('downloadQuarantineReport', 'Download Quarantine Report (Excel)')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {dryRunResult && !importStarted && (
                    <div className={styles.commitSummary}>
                      <h4>{t('importConfirmation', 'Import Confirmation')}</h4>
                      <p>
                        {t('readyToImport', 'Ready to import')} <strong>{dryRunResult.stats.okRows}</strong>{' '}
                        {t('validRows', 'valid rows')}.
                      </p>
                      {dryRunResult.stats.quarantinedRows > 0 && (
                        <p className={styles.warningText}>
                          <strong>{dryRunResult.stats.quarantinedRows}</strong> rows will be skipped due to validation
                          issues.
                        </p>
                      )}

                      <div className={styles.actionButtons}>
                        <Button kind="secondary" onClick={handleReset} className={styles.actionButton}>
                          {t('clear', 'Clear')}
                        </Button>
                        <Button
                          disabled={isImporting || dryRunResult.stats.okRows === 0}
                          onClick={handleImport}
                          className={styles.actionButton}
                        >
                          {isImporting ? <InlineLoading description="Importing..." /> : 'Start Import'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {commitResult && (
                    <div className={styles.importResults}>
                      <div className={styles.resultsSummary}>
                        <h4>{t('importComplete', 'Import Complete')}</h4>
                        <div className={styles.statsGrid}>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>{t('totalProcessed', 'Total Processed')}:</span>
                            <span className={styles.statValue}>{commitResult.summary.totalProcessed}</span>
                          </div>
                          <div className={`${styles.statItem} ${styles.success}`}>
                            <span className={styles.statLabel}>{t('successful', 'Successful')}:</span>
                            <span className={styles.statValue}>{commitResult.summary.successful}</span>
                          </div>
                          <div className={`${styles.statItem} ${styles.error}`}>
                            <span className={styles.statLabel}>{t('failed', 'Failed')}:</span>
                            <span className={styles.statValue}>{commitResult.summary.failed}</span>
                          </div>
                        </div>
                      </div>

                      {commitResult.results.length > 0 && (
                        <div className={styles.resultsDetails}>
                          <h4>{t('importDetails', 'Import Details')}</h4>
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
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.emptyState}>
                  {t('uploadFileAndRunValidation', 'Upload a file and run validation to see results here.')}
                </p>
              )}
            </Tile>
          </Column>
        </Grid>
      </div>
    </div>
  );
};

export default ImportData;
