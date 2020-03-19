import testUntyped from 'ava';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import React from 'react';
import { empty, of, BehaviorSubject } from 'rxjs';
import { connect } from './connect';
import { spy, SinonSpy } from 'sinon';
import { TestInterface } from 'ava';

type Props = { msg: string; num?: number };
const initialProps = { msg: 'hello' };
const secondProps = { msg: 'second' };
const additionalProps = { num: 3 };
const secondAdditionalProps = { num: 7 };
const WrappedComponent = ({ msg }: Props) => React.createElement('p', {}, msg);

type Context = {
  WrappedComponentSpy: SinonSpy<[Props], ReturnType<typeof WrappedComponent>>;
};

const test = testUntyped as TestInterface<Context>;

test.beforeEach((t) => {
  t.context.WrappedComponentSpy = spy(({ msg }: Props) =>
    React.createElement('p', {}, msg)
  );
});

test.afterEach((t) => t.context.WrappedComponentSpy.resetHistory());

test('connect should render null on first render', (t) => {
  const { WrappedComponentSpy } = t.context;
  const HOComponent = connect(WrappedComponentSpy, empty());

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

  t.notDeepEqual(props$.observers, []);

  act(() => {
    component.unmount();
  });

  t.deepEqual(props$.observers, []);
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
      })
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
