import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';

/**
 * React hook to subscribe to a stream
 *
 * Each emit from the stream will make the component re-render with the new
 * value. Initially the `initial` argument is returned, because an `Observable`
 * has no guarantee for when the first emit will happen.
 *
 * This hook passes the `source$` argument as a dependency to `useEffect`, which
 * means you will need to take care that it is referentially equal between each
 * render (unless you want to resubscribe, of course). Generally, you should
 * only use this hook for static/global streams.
 *
 * @param source$ Stream that provides the needed values
 * @param initial Initial value to return
 * @see useEffect
 */
export const useStream = <T, I>(source$: Observable<T>, initial: I): T | I => {
  const [value, setValue] = useState<T | I>(initial);

  useEffect(() => {
    const subscription = source$.subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [source$]);

  return value;
};
