import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback, useState } from 'react';
import type { DryRunResponse, CommitResponse, BackendDryRunResponse, BackendCommitResponse } from '../types';

export function useImportData() {
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dryRunError, setDryRunError] = useState<Error | null>(null);
  const [importError, setImportError] = useState<Error | null>(null);

  const performDryRun = useCallback(async (file: File): Promise<DryRunResponse> => {
    setDryRunError(null);
    setIsDryRunning(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = `${restBaseUrl}/dataimport`;

      const response = await openmrsFetch<BackendDryRunResponse>(url, {
        method: 'POST',
        body: formData,
      });

      const data = response.data;

      return {
        batchId: data.batchId,
        stats: {
          totalRows: data.stats?.totalRows || 0,
          okRows: data.okRows?.length || 0,
          quarantinedRows: data.quarantinedRows?.length || 0,
          errorRows: 0,
        },
        issues: data.quarantinedRows || [],
        templateMeta: {
          templateName: 'Imported Template',
          defaultLocationUuid: '',
          formCount: 0,
          forms: [],
        },
      };
    } catch (e) {
      const error = e as Error;
      setDryRunError(error);
      throw error;
    } finally {
      setIsDryRunning(false);
    }
  }, []);

  const commitImport = useCallback(async (batchId: string): Promise<CommitResponse> => {
    setImportError(null);
    setIsImporting(true);

    try {
      const url = `${restBaseUrl}/dataimport?batchId=${batchId}`;

      const response = await openmrsFetch<BackendCommitResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {},
      });

      const data = response.data;

      return {
        batchId: data.batchId,
        results:
          data.createdEncounterUuids?.map((uuid: string, index: number) => ({
            patientRef: `Patient-${index + 1}`,
            status: 'SUCCESS' as const,
            encounterUuid: uuid,
            message: 'Successfully imported',
          })) || [],
        summary: {
          totalProcessed: data.stats?.totalProcessed || 0,
          successful: data.createdEncounterUuids?.length || 0,
          failed: data.errors?.length || 0,
        },
      };
    } catch (e) {
      const error = e as Error;
      setImportError(error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const downloadQuarantineReport = useCallback(async (file: File, batchId: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchId', batchId);

      const url = `${restBaseUrl}/dataimport/quarantine-report.xlsx`;

      const response = await openmrsFetch<Response>(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `quarantine_report_${batchId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      const error = e as Error;
      throw error;
    }
  }, []);

  return {
    performDryRun,
    commitImport,
    downloadQuarantineReport,
    isDryRunning,
    isImporting,
    dryRunError,
    importError,
  };
}

export default useImportData;
