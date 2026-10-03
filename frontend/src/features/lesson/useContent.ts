import { useCallback, useEffect, useState } from 'react';
import { LessonApiError } from './lessonApi';

export interface ContentState<T> {
  data: T | null;
  error: LessonApiError | null;
  loading: boolean;
  retry: () => void;
}

/** Loads `load()` whenever `key` changes, with loading/error state and a retry. */
export function useContent<T>(key: string, load: () => Promise<T>): ContentState<T> {
  const [state, setState] = useState<{ key: string; data: T | null; error: LessonApiError | null }>({
    key: '',
    data: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => !cancelled && setState({ key, data, error: null }),
      (err) =>
        !cancelled &&
        setState({
          key,
          data: null,
          error: err instanceof LessonApiError ? err : new LessonApiError('Something went wrong.', 0),
        }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => {
    setState({ key: '', data: null, error: null });
    setAttempt((n) => n + 1);
  }, []);

  const current = state.key === key;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !current || (state.data === null && state.error === null),
    retry,
  };
}
