import { useEffect, useState } from 'react';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

const asyncStates = {
  idle: <T>(): AsyncState<T> => ({ status: 'idle' }),
  loading: <T>(): AsyncState<T> => ({ status: 'loading' }),
  success: <T>(data: T): AsyncState<T> => ({ status: 'success', data }),
  error: <T>(error: Error): AsyncState<T> => ({ status: 'error', error }),
};

export const useAsyncState = <T>(asyncFunction: () => Promise<T>) => {
  const [state, setState] = useState<AsyncState<T>>(asyncStates.idle());

  useEffect(() => {
    const fn = async () => {
      setState(asyncStates.loading());

      try {
        const data = await asyncFunction();
        setState(asyncStates.success(data));
      } catch (error) {
        setState(
          asyncStates.error(
            error instanceof Error ? error : new Error('Unknown error'),
          ),
        );
      }
    };

    void fn();
  }, []);

  return state;
};
