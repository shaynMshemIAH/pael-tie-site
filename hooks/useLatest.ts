import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLatest(fieldId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/telemetry/latest?field_id=${fieldId}`,
    fetcher 
  };
  
  return {
    data,
    isLoading,
    isError: error
  };
}
