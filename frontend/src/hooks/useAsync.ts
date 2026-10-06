import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; value: T };

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Request failed');

/**
 * Run a request and keep loading, error and data apart. `run` is re-executed when any of `deps` changes or
 * when `reload` is called; a pass of null `run` stays in loading (for requests that wait on another one).
 */
export function useAsync<T>(run: (() => Promise<T>) | null, deps: unknown[]): [AsyncState<T>, () => void] {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!run) return;
    let live = true;
    setState({ status: 'loading' });
    run()
      .then((value) => live && setState({ status: 'ready', value }))
      .catch((e: unknown) => live && setState({ status: 'error', message: errorText(e) }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller passes the dependencies explicitly
  }, [...deps, nonce]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return [state, reload];
}
