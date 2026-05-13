import { useState, useEffect } from 'react';
import api, { publicApi } from '../api/axios';

export function useFetch(url, params = {}, { isPublic = false } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const key = url + JSON.stringify(params);
  const client = isPublic ? publicApi : api;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    client.get(url, { params })
      .then(res => { if (!cancelled) setData(res.data.data); })
      .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Xəta baş verdi'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key]);

  return { data, loading, error };
}

export function usePublicFetch(url, params = {}) {
  return useFetch(url, params, { isPublic: true });
}
