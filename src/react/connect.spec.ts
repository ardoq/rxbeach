import testUntyped, { TestFn } from 'ava';
import { ReactTestRenderer, act, create } from 'react-test-renderer';
import React from 'react';
import { BehaviorSubject, EMPTY, Subject, of } from 'rxjs';
import { NOT_YET_EMITTED, connect, useStream } from './connect';
import { SinonSpy, spy } from 'sinon';
import { renderHook } from '../internal/testing/renderHook';

type Props = { msg: string; num?: number };
const initialProps = { msg: 'hello' };
const secondProps = { msg: 'second' };
const additionalProps = { num: 3 };
const secondAdditionalProps = { num: 7 };
const WrappedComponent = ({ msg }: Props) => React.createElement('p', {}, msg);

type Context = {
  WrappedComponentSpy: SinonSpy<[Props], ReturnType<typeof WrappedComponent>>;
};

const test = testUntyped as TestFn<Context>;

test.beforeEach((t) => {
  t.context.WrappedComponentSpy = spy(({ msg }: Props) =>
    React.createElement('p', {}, msg)
  );
});

test.afterEach((t) => t.context.WrappedComponentSpy.resetHistory());

test('useStream return initial value right away', (t) => {
  const { result } = renderHook(() => useStream(EMPTY));

  t.deepEqual(result.current, NOT_YET_EMITTED);
});

test('useStream return default value (if defined) right away', (t) => {
  const { result } = renderHook(() => useStream(EMPTY, 'default value'));

  t.deepEqual(result.current, 'default value');
});

test('useStream return value from stream', (t) => {
  const source$ = new Subject<Props>();
  const { result } = renderHook(() => useStream(source$));

  source$.next(initialProps);

  t.deepEqual(result.current, initialProps);
});

test('useStream unsubscribes on unmount', (t) => {
  const source$ = new Subject<string>();
  const { unmount } = renderHook(() => useStream(source$));

  unmount();

  t.false(source$.observed);
});

test('useStream does not resubscribe on rerender', (t) => {
  const source$ = new Subject<string>();
  const { rerender } = renderHook(() => useStream(source$));

  const subscription = source$.observers[0];
  rerender();

  t.assert(source$.observers[0] === subscription);
});

test('useStream unsubscribes, keeps latest value and subscribes new stream', (t) => {
  const alpha = new Subject<Props>();
  const bravo = new Subject<Props>();

  const { rerender, result } = renderHook(({ source$ }) => useStream(source$), {
    initialProps: { source$: alpha },
  });

  alpha.next(initialProps);
  rerender({ source$: bravo });

  t.deepEqual(result.current, initialProps);
  t.false(alpha.observed);
  t.assert(bravo.observed);
});

test('connect should render null on first render', (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, EMPTY);

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent));
  });

  t.assert(WrappedComponentSpy.notCalled);
  t.deepEqual(component!.toJSON(), null);
});

test('connect should immediately send props to wrapped component', (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(React.createElement(HOComponent));
  });

  t.deepEqual(WrappedComponentSpy.firstCall.args[0], initialProps);
});

test('connect should re-render wrapped component on emitted props', (t) => {
  const { WrappedComponentSpy } = t.context;
  const props$ = new BehaviorSubject<Props>(initialProps);
  const HOComponent = connect(WrappedComponentSpy, props$);

  act(() => {
    create(React.createElement(HOComponent));
  });
  t.deepEqual(WrappedComponentSpy.firstCall.args[0], initialProps);

  act(() => {
    props$.next(secondProps);
  });
  t.deepEqual(WrappedComponentSpy.secondCall.args[0], secondProps);
});

test('connect should unsubscribe stream when unmounted', async (t) => {
  const props$ = new BehaviorSubject<Props>(initialProps);
  const HOComponent = connect(WrappedComponent, props$);

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent));
  });

  t.assert(props$.observed);

  act(() => {
    component.unmount();
  });

  t.false(props$.observed);
});

test('connect should forward props', async (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(React.createElement(HOComponent, additionalProps));
  });

  t.deepEqual(WrappedComponentSpy.firstCall?.args[0], {
    ...additionalProps,
    ...initialProps,
  });
});

test('connect give streamed props precedence over forwarded props', (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  act(() => {
    create(
      React.createElement(HOComponent, {
        ...additionalProps,
        msg: 'overriding should not work',
      } as any)
    );
  });

  t.deepEqual(WrappedComponentSpy.firstCall?.args[0], {
    ...additionalProps,
    ...initialProps,
  });
});

test('connect should propagate changes to forwarded props', async (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, of(initialProps));

  let component: ReactTestRenderer;
  act(() => {
    component = create(React.createElement(HOComponent, additionalProps));
  });
  act(() => {
    component.update(React.createElement(HOComponent, secondAdditionalProps));
  });

  t.deepEqual(WrappedComponentSpy.firstCall?.args[0], {
    ...additionalProps,
    ...initialProps,
  });
  t.deepEqual(WrappedComponentSpy.secondCall?.args[0], {
    ...secondAdditionalProps,
    ...initialProps,
  });
});
