import sinon from 'sinon';
import testUntyped, { TestFn } from 'ava';
import { StateStreamRegistry } from './stateStreamRegistry';
import { ObservableState } from './observableState';
import { EMPTY } from 'rxjs';

const test = testUntyped as TestFn<{
  registry: StateStreamRegistry;
  stream: ObservableState<number>;
}>;

test.beforeEach((t) => {
  t.context.registry = new StateStreamRegistry();
  t.context.stream = new ObservableState<number>('spiedStream', EMPTY, 1);
});

test('stateStreamRegistry.register should throw error for duplicate names', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream);
  t.throws(() => registry.register(stream));
});

test('stateStreamRegistry.register should throw error for duplicate name after start', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream);
  registry.startReducing();

  t.throws(() => registry.register(stream));
});

test('stateStreamRegistry.register should not start streams before startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'connect');
  t.teardown(() => spy.restore());

  registry.register(stream);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.startReducing should call connect', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'connect');
  t.teardown(() => spy.restore());

  registry.register(stream);
  registry.startReducing();

  t.assert(spy.called);
});

test('stateStreamRegistry.startReducing should error on double call', (t) => {
  const { registry } = t.context;

  registry.startReducing();
  t.throws(() => registry.startReducing());
});

test('stateStreamRegistry.register should start streams after startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'connect');
  t.teardown(() => spy.restore());

  registry.startReducing();
  registry.register(stream);

  t.assert(spy.called);
});

test('stateStreamRegistry.register should not start streams after stopReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'connect');
  t.teardown(() => spy.restore());

  registry.startReducing();
  registry.stopReducing();
  registry.register(stream);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.stopReducing should call unsubscribe', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'unsubscribe');
  t.teardown(() => spy.restore());

  registry.register(stream);
  registry.startReducing();
  registry.stopReducing();

  t.assert(spy.called);
});
