import { useState, useEffect, useCallback } from "react";

/**
 * 범용 비동기 데이터 페칭 훅
 *
 * @param {(...args: any[]) => Promise<any>} fetchFn  - 서비스 함수
 * @param {any[]} deps                                - 의존성 배열 (변경 시 재요청)
 * @param {any}   initialData                         - 초기 데이터 (로딩 중 표시할 기본값)
 *
 * @example
 * const { data: events, loading } = useFetch(
 *   () => getEvents(church.id, { year, month }),
 *   [church.id, year, month],
 *   []
 * );
 */
export function useFetch(fetchFn, deps = [], initialData = null) {
  const [data, setData]       = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
      console.error("[useFetch] error:", err);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
