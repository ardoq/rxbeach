import test from 'ava';
import { renderHook } from '@testing-library/react-hooks';
import { useStream, NOT_YET_EMITTED } from './useStream';
import { empty, Subject } from 'rxjs';

const second = 'A';

test('useStream return initial value right away', t => {
  const { result } = renderHook(() => useStream(empty()));

  t.deepEqual(result.current, NOT_YET_EMITTED);
});

test('useStream return value from stream', t => {
  const source$ = new Subject<string>();
  const { result } = renderHook(() => useStream(source$));

  source$.next(second);

  t.deepEqual(result.current, second);
});

test('useStream unsubscribes on unmount', t => {
  const source$ = new Subject<string>();
  const { unmount } = renderHook(() => useStream(source$));

  unmount();

  t.deepEqual(source$.observers, []);
});

test('useStream does not resubscribe on rerender', t => {
  const source$ = new Subject<string>();
  const { rerender } = renderHook(() => useStream(source$));

  const subscription = source$.observers[0];
  rerender();

  t.assert(source$.observers[0] === subscription);
});

test('useStream unsubscribes, keeps latest value and subscribes new stream', t => {
  const alpha = new Subject<string>();
  const bravo = new Subject<string>();

  const { rerender, result } = renderHook(({ source$ }) => useStream(source$), {
    initialProps: { source$: alpha },
  });

  alpha.next(second);
  rerender({ source$: bravo });

  t.deepEqual(result.current, second);
  t.deepEqual(alpha.observers, []);
  t.deepEqual(bravo.observers.length, 1);
});
