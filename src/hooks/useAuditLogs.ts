import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback, useState } from 'react';
import type { AuditLog, AuditLogDetail, AuditLogsResponse, AuditLogConfig, AuditLogCleanupResponse } from '../types';

export interface AuditLogFilters {
  status?: 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS' | 'VALIDATION_ERRORS';
  action?: 'DRY_RUN' | 'COMMIT';
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  startIndex?: number;
  maxResults?: number;
}

export function useAuditLogs() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAuditLogs = useCallback(async (filters?: AuditLogFilters): Promise<AuditLogsResponse> => {
    setError(null);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.userId) params.append('userId', filters.userId.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString().split('T')[0]);
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString().split('T')[0]);
      if (filters?.startIndex !== undefined) params.append('startIndex', filters.startIndex.toString());
      if (filters?.maxResults !== undefined) params.append('maxResults', filters.maxResults.toString());

      const url = `${restBaseUrl}/dataimport/audit?${params.toString()}`;

      const response = await openmrsFetch<AuditLogsResponse>(url, {
        method: 'GET',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecentAuditLogs = useCallback(async (limit: number = 10): Promise<AuditLog[]> => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `${restBaseUrl}/dataimport/audit/recent?limit=${limit}`;

      const response = await openmrsFetch<AuditLog[]>(url, {
        method: 'GET',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAuditLogByUuid = useCallback(async (uuid: string): Promise<AuditLogDetail> => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `${restBaseUrl}/dataimport/audit/${uuid}`;

      const response = await openmrsFetch<AuditLogDetail>(url, {
        method: 'GET',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAuditLogsByBatchId = useCallback(async (batchId: string): Promise<AuditLogDetail[]> => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `${restBaseUrl}/dataimport/audit/batch/${batchId}`;

      const response = await openmrsFetch<AuditLogDetail[]>(url, {
        method: 'GET',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanupOldLogs = useCallback(async (): Promise<AuditLogCleanupResponse> => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `${restBaseUrl}/dataimport/audit/cleanup`;

      const response = await openmrsFetch<AuditLogCleanupResponse>(url, {
        method: 'POST',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getConfig = useCallback(async (): Promise<AuditLogConfig> => {
    setError(null);
    setIsLoading(true);

    try {
      const url = `${restBaseUrl}/dataimport/audit/config`;

      const response = await openmrsFetch<AuditLogConfig>(url, {
        method: 'GET',
      });

      return response.data;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAuditLogs,
    getRecentAuditLogs,
    getAuditLogByUuid,
    getAuditLogsByBatchId,
    cleanupOldLogs,
    getConfig,
    isLoading,
    error,
  };
}

export default useAuditLogs;
