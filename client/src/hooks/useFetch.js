import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export function useFetch(url, params = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const paramsKey = JSON.stringify(params);
  const abortRef  = useRef(null);

  useEffect(() => {
    if (!url) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current  = controller;

    setLoading(true);
    setError(null);

    api.get(url, { params, signal: controller.signal })
      .then(res => setData(res.data.data ?? res.data))
      .catch(err => {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.message ?? err.message ?? 'Xəta baş verdi');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url, paramsKey]);

  return { data, loading, error };
}
