import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface Location {
  uuid: string;
  name: string;
  display?: string;
}

const locationRepresentation = '(uuid,name,display)';
const locationsUrl = `${restBaseUrl}/location?v=custom:${locationRepresentation}`;

export function useGetAllLocations() {
  const { data, error } = useSWR(locationsUrl, async () => {
    const res = await openmrsFetch(locationsUrl);
    return (res?.data?.results ?? []) as Location[];
  });

  return {
    locations: data,
    isLoading: !error && !data,
    error,
  };
}

export default useGetAllLocations;


