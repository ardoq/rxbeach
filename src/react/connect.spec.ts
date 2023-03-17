import { ReactTestRenderer, act, create } from 'react-test-renderer';
import React from 'react';
import { BehaviorSubject, EMPTY, Observable, Subject, of } from 'rxjs';
import {
  NOT_YET_EMITTED,
  connect,
  connectInstance,
  useStream,
} from './connect';
import { renderHook } from '../internal/testing/renderHook';

type Props = { msg: string; num?: number };
const initialProps = { msg: 'hello' };
const secondProps = { msg: 'second' };
const additionalProps = { num: 3 };
const secondAdditionalProps = { num: 7 };
const WrappedComponent = ({ msg }: Props) => React.createElement('p', {}, msg);

const WrappedComponentSpy = jest.fn(WrappedComponent);

afterEach(() => {
  WrappedComponentSpy.mockClear();
});

test('useStream return initial value right away', () => {
  const { result } = renderHook(() => useStream(EMPTY));

  expect(result.current).toEqual(NOT_YET_EMITTED);
});

test('useStream return default value (if defined) right away', () => {
  const { result } = renderHook(() => useStream(EMPTY, 'default value'));

  expect(result.current).toEqual('default value');
});

test('useStream return value from stream', () => {
  const source$ = new Subject<Props>();
  const { result } = renderHook(() => useStream(source$));

  act(() => {
    source$.next(initialProps);
  });

  expect(result.current).toEqual(initialProps);
});

test('useStream unsubscribes on unmount', () => {
  const source$ = new Subject<string>();
  const { unmount } = renderHook(() => useStream(source$));

  unmount();

  expect(source$.observed).toBe(false);
});

test('useStream does not resubscribe on rerender', () => {
  let subscriptions = 0;
  const source$ = new Observable<string>((obs) => {
    subscriptions++;
    obs.next('hello');
  });

  const { rerender } = renderHook(() => useStream(source$));
  rerender();

  expect(subscriptions).toEqual(1);
});

test('useStream unsubscribes, keeps latest value and subscribes new stream', () => {
  const alpha = new Subject<Props>();
  const bravo = new Subject<Props>();

  const { rerender, result } = renderHook(({ source$ }) => useStream(source$), {
    initialProps: { source$: alpha },
  });

  act(() => {
    alpha.next(initialProps);
  });
  rerender({ source$: bravo });

  expect(result.current).toEqual(initialProps);
  expect(alpha.observed).toBe(false);
  expect(bravo.observed).toBe(true);
});

test('connect should render null on first render', () => {
  const HOComponent = connect(WrappedComponentSpy, EMPTY);

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent));
  });

  expect(WrappedComponentSpy).not.toHaveBeenCalled();
  expect(component!.toJSON()).toEqual(null);
});

test('connect should immediately send props to wrapped component', () => {
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(React.createElement(HOComponent));
  });

  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(1, initialProps, {});
});

test('connect should re-render wrapped component on emitted props', () => {
  const props$ = new BehaviorSubject<Props>(initialProps);
  const HOComponent = connect(WrappedComponentSpy, props$);

  act(() => {
    create(React.createElement(HOComponent));
  });
  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(1, initialProps, {});

  act(() => {
    props$.next(secondProps);
  });
  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(2, secondProps, {});
});

test('connect should unsubscribe stream when unmounted', async () => {
  const props$ = new BehaviorSubject<Props>(initialProps);
  const HOComponent = connect(WrappedComponent, props$);

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent));
  });

  expect(props$.observed).toBe(true);

  act(() => {
    component.unmount();
  });

  expect(props$.observed).toBe(false);
});

test('connect should forward props', async () => {
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(React.createElement(HOComponent, additionalProps));
  });

  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    1,
    { ...additionalProps, ...initialProps },
    {}
  );
});

test('connect give streamed props precedence over forwarded props', () => {
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(
      React.createElement(HOComponent, {
        ...additionalProps,
        msg: 'overriding should not work',
      } as any)
    );
  });

  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    1,
    { ...additionalProps, ...initialProps },
    {}
  );
});

test('connect should propagate changes to forwarded props', async () => {
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent, additionalProps));
  });
  act(() => {
    component.update(React.createElement(HOComponent, secondAdditionalProps));
  });

  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    1,
    {
      ...additionalProps,
      ...initialProps,
    },
    {}
  );
  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    2,
    {
      ...secondAdditionalProps,
      ...initialProps,
    },
    {}
  );
});

test('connectInstance should provide unique instance Id', () => {
  let instance1: string | null = null;
  let instance2: string | null = null;
  const HOComponent1 = connectInstance(WrappedComponentSpy, (msg) => {
    instance1 = msg;
    return of({ msg });
  });
  const HOComponent2 = connectInstance(WrappedComponentSpy, (msg) => {
    instance2 = msg;
    return of({ msg });
  });

  act(() => {
    create(React.createElement(HOComponent1));
    create(React.createElement(HOComponent2));
  });

  expect(instance1).toBeTruthy();
  expect(instance2).toBeTruthy();
  expect(instance1).not.toBe(instance2);
  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    1,
    { msg: instance1 },
    {}
  );
  expect(WrappedComponentSpy).toHaveBeenNthCalledWith(
    2,
    { msg: instance2 },
    {}
  );
});
