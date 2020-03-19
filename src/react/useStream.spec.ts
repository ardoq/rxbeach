import test from 'ava';
import { renderHook } from '@testing-library/react-hooks';
import { useStream } from './useStream';
import { empty, Subject } from 'rxjs';

const initial = 'x';
const second = 'A';

test('useStream return initial value right away', t => {
  const { result } = renderHook(() => useStream(empty(), initial));

  t.deepEqual(result.current, 'x');
});

test('useStream return value from stream', t => {
  const source$ = new Subject<string>();
  const { result } = renderHook(() => useStream(source$, initial));

  source$.next(second);

  t.deepEqual(result.current, second);
});

test('useStream unsubscribes on unmount', t => {
  const source$ = new Subject<string>();
  const { unmount } = renderHook(() => useStream(source$, initial));

  unmount();

  t.deepEqual(source$.observers, []);
});

test('useStream does not resubscribe on rerender', t => {
  const source$ = new Subject<string>();
  const { rerender } = renderHook(() => useStream(source$, initial));

  const subscription = source$.observers[0];
  rerender();

  t.assert(source$.observers[0] === subscription);
});

test('useStream does not update for changed initial value', t => {
  const source$ = new Subject<string>();
  const { rerender, result } = renderHook(
    props => useStream(source$, props.initial),
    {
      initialProps: { initial },
    }
  );

  source$.next(second);
  rerender({ initial: 'something' });

  t.deepEqual(result.current, second);
});

test('useStream unsubscribes, keeps latest value and subscribes new stream', t => {
  const source1$ = new Subject<string>();
  const source2$ = new Subject<string>();

  const { rerender, result } = renderHook(
    props => useStream(props.source$, initial),
    {
      initialProps: { source$: source1$ },
    }
  );

  source1$.next(second);
  rerender({ source$: source2$ });

  t.deepEqual(result.current, second);
  t.deepEqual(source1$.observers, []);
  t.deepEqual(source2$.observers.length, 1);
});
