import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useCallback, useState } from 'react';

interface UiTemplateOptions {
  includePatientRegistration: boolean;
  filename?: string;
}

interface ServerTemplateOptions {
  includePatient?: boolean;
}

export function useGenerateTemplate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (formUuids: string[], options: UiTemplateOptions) => {
    setError(null);
    setIsGenerating(true);

    try {
      const url = `${restBaseUrl}/dataimport/forms/template.xlsx`;
      const payload = {
        formUuids,
        options: {
          includePatient: options?.includePatientRegistration,
        } as ServerTemplateOptions,
      };

      const abortController = new AbortController();

      const response = await openmrsFetch<Response>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: null,
        },
        body: payload,
        signal: abortController.signal,
      });

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition') || '';
      let filename = options?.filename || 'o3_form_template.xlsx';
      const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      if (match) {
        filename = decodeURIComponent(match[1] || match[2]);
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error };
}

export default useGenerateTemplate;
