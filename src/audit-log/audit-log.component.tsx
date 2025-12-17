import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
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
  Pagination,
  Select,
  SelectItem,
  Modal,
} from '@carbon/react';
import { View, TrashCan, Renew, Close } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import { useAuditLogs } from '../hooks/useAuditLogs';
import type { AuditLog, AuditLogDetail } from '../types';
import styles from './audit-log.scss';

const AuditLogComponent: React.FC = () => {
  const { t } = useTranslation();
  const { getAuditLogs, getAuditLogByUuid, cleanupOldLogs, getConfig, isLoading } = useAuditLogs();

  const [logs, setLogs] = useState<AuditLogDetail[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS' | 'VALIDATION_ERRORS' | ''>(
    '',
  );
  const [actionFilter, setActionFilter] = useState<'DRY_RUN' | 'COMMIT' | ''>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(0);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const config = await getConfig();
      setRetentionDays(config.retentionDays);
    } catch (error) {
      showSnackbar({
        title: t('errorLoadingConfig', 'Error Loading Config'),
        subtitle: (error as Error).message || t('failedToLoadConfig', 'Failed to load configuration'),
        kind: 'error',
      });
    }
  }, [getConfig, t]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const filters = {
        status: statusFilter !== '' ? statusFilter : undefined,
        action: actionFilter !== '' ? actionFilter : undefined,
        startIndex: (page - 1) * pageSize,
        maxResults: pageSize,
      };
      const response = await getAuditLogs(filters);

      // Check if response and results are valid
      if (!response || !response.results) {
        throw new Error('Invalid response format from API');
      }

      // Fetch detailed information for all logs in parallel
      const detailPromises = response.results.map((log) => getAuditLogByUuid(log.uuid));
      const detailedLogs = await Promise.all(detailPromises);

      setLogs(detailedLogs);
      setTotalCount(response.totalCount);
    } catch (error) {
      showSnackbar({
        title: t('errorLoadingLogs', 'Error Loading Logs'),
        subtitle: (error as Error).message || t('failedToLoadAuditLogs', 'Failed to load audit logs'),
        kind: 'error',
      });
      // Reset to empty state on error
      setLogs([]);
      setTotalCount(0);
    }
  }, [statusFilter, actionFilter, page, pageSize, getAuditLogs, getAuditLogByUuid, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleToggleRow = (uuid: string) => {
    const newExpandedRows = new Set(expandedRows);

    if (expandedRows.has(uuid)) {
      // Collapse row
      newExpandedRows.delete(uuid);
    } else {
      // Expand row
      newExpandedRows.add(uuid);
    }

    setExpandedRows(newExpandedRows);
  };

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupOldLogs();
      showSnackbar({
        title: t('cleanupSuccess', 'Cleanup Successful'),
        subtitle: result.message,
        kind: 'success',
      });
      setIsCleanupModalOpen(false);
      loadAuditLogs();
    } catch (error) {
      showSnackbar({
        title: t('cleanupFailed', 'Cleanup Failed'),
        subtitle: (error as Error).message || t('failedToCleanupLogs', 'Failed to cleanup old logs'),
        kind: 'error',
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleRefresh = () => {
    loadAuditLogs();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setActionFilter('');
    setPage(1);
  };

  const getStatusTag = (status: string): React.ReactNode => {
    const tagMap = {
      SUCCESS: { type: 'green', label: t('success', 'Success') },
      FAILED: { type: 'red', label: t('failed', 'Failed') },
      PARTIAL_SUCCESS: { type: 'cyan', label: t('partialSuccess', 'Partial Success') },
      VALIDATION_ERRORS: { type: 'magenta', label: t('validationErrors', 'Validation Errors') },
    };

    const tag = tagMap[status] || { type: 'gray', label: status };
    return <Tag type={tag.type as any}>{tag.label}</Tag>;
  };

  const getActionTag = (action: string): React.ReactNode => {
    const tagMap = {
      DRY_RUN: { type: 'blue', label: t('dryRun', 'Dry Run') },
      COMMIT: { type: 'purple', label: t('commit', 'Commit') },
    };

    const tag = tagMap[action] || { type: 'gray', label: action };
    return <Tag type={tag.type as any}>{tag.label}</Tag>;
  };

  const formatDuration = (durationMs?: number): string => {
    if (!durationMs) return 'N/A';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(2)}s`;
  };

  const renderExpandedContent = (log: AuditLogDetail) => {
    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>{t('basicInformation', 'Basic Information')}</h4>
          <dl className={styles.detailList}>
            <div>
              <dt>{t('batchId', 'Batch ID')}:</dt>
              <dd>{log.batchId}</dd>
            </div>
            <div>
              <dt>{t('filename', 'Filename')}:</dt>
              <dd>{log.filename}</dd>
            </div>
            <div>
              <dt>{t('status', 'Status')}:</dt>
              <dd>{getStatusTag(log.status)}</dd>
            </div>
            <div>
              <dt>{t('action', 'Action')}:</dt>
              <dd>{getActionTag(log.action)}</dd>
            </div>
            <div>
              <dt>{t('creator', 'Creator')}:</dt>
              <dd>{log.creatorName || log.creator || 'N/A'}</dd>
            </div>
            <div>
              <dt>{t('dateCreated', 'Date Created')}:</dt>
              <dd>{dayjs(log.dateCreated).format('YYYY-MM-DD HH:mm:ss')}</dd>
            </div>
            <div>
              <dt>{t('duration', 'Duration')}:</dt>
              <dd>{formatDuration(log.durationMs)}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.expandedSection}>
          <h4>{t('statistics', 'Statistics')}</h4>
          <dl className={styles.detailList}>
            <div>
              <dt>{t('totalRows', 'Total Rows')}:</dt>
              <dd>{log.totalRows || 0}</dd>
            </div>
            <div>
              <dt>{t('successfulRows', 'Successful Rows')}:</dt>
              <dd>{log.successfulRows || 0}</dd>
            </div>
            <div>
              <dt>{t('quarantinedRows', 'Quarantined Rows')}:</dt>
              <dd>{log.quarantinedRows || 0}</dd>
            </div>
            <div>
              <dt>{t('patientsCreated', 'Patients Created')}:</dt>
              <dd>{log.patientsCreated || 0}</dd>
            </div>
            <div>
              <dt>{t('encountersCreated', 'Encounters Created')}:</dt>
              <dd>{log.encountersCreated || 0}</dd>
            </div>
            <div>
              <dt>{t('obsCreated', 'Observations Created')}:</dt>
              <dd>{log.obsCreated || 0}</dd>
            </div>
          </dl>
        </div>

        {log.errorSummary && (
          <div className={styles.expandedSection}>
            <h4>{t('errorSummary', 'Error Summary')}</h4>
            <p>{log.errorSummary}</p>
          </div>
        )}

        {log.errors && log.errors.length > 0 && (
          <div className={styles.expandedSection}>
            <h4>
              {t('errors', 'Errors')} ({log.errorCount || log.errors.length})
            </h4>
            <DataTable
              rows={log.errors.slice(0, 10).map((error, index) => ({
                id: index.toString(),
                sheetName: error.sheetName,
                rowIndex: error.rowIndex,
                columnIndex: error.columnIndex,
                errorCode: error.errorCode,
                errorMessage: error.errorMessage,
              }))}
              headers={[
                { key: 'sheetName', header: t('sheet', 'Sheet') },
                { key: 'rowIndex', header: t('row', 'Row') },
                { key: 'columnIndex', header: t('column', 'Column') },
                { key: 'errorCode', header: t('errorCode', 'Error Code') },
                { key: 'errorMessage', header: t('errorMessage', 'Error Message') },
              ]}
              size="sm"
            >
              {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                <Table {...getTableProps()} size="sm">
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
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
            {log.errors.length > 10 && (
              <p className={styles.moreErrors}>
                {t('showingFirstErrors', 'Showing first 10 of {{total}} errors', { total: log.errors.length })}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.auditLog}>
      <div className="mainContent">
        <Grid className="componentGrid">
          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <div className={styles.filterSection}>
                <h3 className={styles.sectionTitle}>{t('filters', 'Filters')}</h3>
                <div className={styles.filterGrid}>
                  <Select
                    id="status-filter"
                    labelText={t('status', 'Status')}
                    value={statusFilter}
                    onChange={(e) => {
                      const newValue = e.target.value as
                        | 'SUCCESS'
                        | 'FAILED'
                        | 'PARTIAL_SUCCESS'
                        | 'VALIDATION_ERRORS'
                        | '';
                      setStatusFilter(newValue);
                    }}
                  >
                    <SelectItem value="" text={t('all', 'All')} />
                    <SelectItem value="SUCCESS" text={t('success', 'Success')} />
                    <SelectItem value="FAILED" text={t('failed', 'Failed')} />
                    <SelectItem value="PARTIAL_SUCCESS" text={t('partialSuccess', 'Partial Success')} />
                    <SelectItem value="VALIDATION_ERRORS" text={t('validationErrors', 'Validation Errors')} />
                  </Select>

                  <Select
                    id="action-filter"
                    labelText={t('action', 'Action')}
                    value={actionFilter}
                    onChange={(e) => {
                      const newValue = e.target.value as 'DRY_RUN' | 'COMMIT' | '';
                      setActionFilter(newValue);
                    }}
                  >
                    <SelectItem value="" text={t('all', 'All')} />
                    <SelectItem value="DRY_RUN" text={t('dryRun', 'Dry Run')} />
                    <SelectItem value="COMMIT" text={t('commit', 'Commit')} />
                  </Select>
                </div>

                <div className={styles.filterActions}>
                  <Button kind="secondary" onClick={handleResetFilters} size="sm">
                    {t('resetFilters', 'Reset Filters')}
                  </Button>
                  <Button kind="tertiary" onClick={handleRefresh} size="sm" renderIcon={Renew}>
                    {t('refresh', 'Refresh')}
                  </Button>
                  <Button
                    kind="danger--tertiary"
                    onClick={() => setIsCleanupModalOpen(true)}
                    size="sm"
                    renderIcon={TrashCan}
                  >
                    {t('cleanupOldLogs', 'Cleanup Old Logs')}
                  </Button>
                </div>
              </div>
            </Tile>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.sectionTile}>
              <h3 className={styles.sectionTitle}>{t('auditLogs', 'Audit Logs')}</h3>

              {isLoading ? (
                <InlineLoading description={t('loadingLogs', 'Loading logs...')} />
              ) : logs.length > 0 ? (
                <>
                  <DataTable
                    rows={logs.map((log) => ({
                      id: log.uuid,
                      filename: log.filename,
                      status: log.status,
                      action: log.action,
                      totalRows: log.totalRows || 0,
                      successfulRows: log.successfulRows || 0,
                      quarantinedRows: log.quarantinedRows || 0,
                      creator: log.creatorName || log.creator || 'N/A',
                      dateCreated: dayjs(log.dateCreated).format('YYYY-MM-DD HH:mm:ss'),
                      duration: formatDuration(log.durationMs),
                    }))}
                    headers={[
                      { key: 'filename', header: t('filename', 'Filename') },
                      { key: 'status', header: t('status', 'Status') },
                      { key: 'action', header: t('action', 'Action') },
                      { key: 'totalRows', header: t('totalRows', 'Total Rows') },
                      { key: 'successfulRows', header: t('successful', 'Successful') },
                      { key: 'quarantinedRows', header: t('quarantined', 'Quarantined') },
                      { key: 'creator', header: t('creator', 'Creator') },
                      { key: 'dateCreated', header: t('dateCreated', 'Date Created') },
                      { key: 'duration', header: t('duration', 'Duration') },
                    ]}
                  >
                    {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getExpandHeaderProps }) => (
                      <TableContainer>
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              <TableHeader {...getExpandHeaderProps()} />
                              {headers.map((header) => (
                                <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => (
                              <React.Fragment key={row.id}>
                                <TableRow
                                  {...getRowProps({ row })}
                                  onClick={() => handleToggleRow(row.id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <TableCell>
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      hasIconOnly
                                      iconDescription={
                                        expandedRows.has(row.id) ? t('collapse', 'Collapse') : t('expand', 'Expand')
                                      }
                                    >
                                      {expandedRows.has(row.id) ? '−' : '+'}
                                    </Button>
                                  </TableCell>
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>
                                      {cell.info.header === 'status'
                                        ? getStatusTag(cell.value)
                                        : cell.info.header === 'action'
                                          ? getActionTag(cell.value)
                                          : cell.value}
                                    </TableCell>
                                  ))}
                                </TableRow>
                                {expandedRows.has(row.id) && (
                                  <TableRow className={styles.expandedRow}>
                                    <TableCell colSpan={headers.length + 1}>
                                      {renderExpandedContent(logs.find((log) => log.uuid === row.id)!)}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </DataTable>

                  <div className={styles.tablePagination}>
                    <Pagination
                      pageSizes={[10, 20, 50, 100]}
                      totalItems={totalCount}
                      page={page}
                      pageSize={pageSize}
                      onChange={({ page, pageSize }) => {
                        setPageSize(pageSize);
                        setPage(page);
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className={styles.emptyState}>{t('noAuditLogsFound', 'No audit logs found')}</p>
              )}
            </Tile>
          </Column>
        </Grid>
      </div>

      <Modal
        open={isCleanupModalOpen}
        onRequestClose={() => setIsCleanupModalOpen(false)}
        modalHeading={t('cleanupOldLogs', 'Cleanup Old Logs')}
        primaryButtonText={isCleaningUp ? t('cleaningUp', 'Cleaning up...') : t('cleanup', 'Cleanup')}
        secondaryButtonText={t('cancel', 'Cancel')}
        onRequestSubmit={handleCleanup}
        danger
        primaryButtonDisabled={isCleaningUp}
      >
        <p>
          {t(
            'cleanupConfirmation',
            'This will delete all audit logs older than {{days}} days. This action cannot be undone.',
            { days: retentionDays },
          )}
        </p>
      </Modal>
    </div>
  );
};

export default AuditLogComponent;
