import { openmrsFetch, userHasAccess, useSession, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const o3FormsUrl = `${restBaseUrl}/dataimport/forms/o3`;

export function useGetAllForms(cachedOfflineFormsOnly = false) {
  const { data, error } = useSWR([o3FormsUrl, cachedOfflineFormsOnly], async () => {
    const res = await openmrsFetch(o3FormsUrl);

    const formsData = res.data?.forms ?? [];
    const forms = formsData.map((form) => ({
      uuid: form.uuid,
      name: form.name,
      display: form.name,
      version: form.version,
      description: form.description,
      published: true,
      retired: false,
      encounterType: form.encounterTypeUuid
        ? {
            uuid: form.encounterTypeUuid,
            name: form.encounterTypeName,
          }
        : undefined,
    }));

    return forms;
  });

  return {
    forms: data,
    isLoading: !error && !data,
    error,
  };
}

export default useGetAllForms;
