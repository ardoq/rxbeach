import sinon from 'sinon';
import testUntyped, { TestInterface } from 'ava';
import { StateStreamRegistry } from './stateStreamRegistry';
import { PersistentReducedStateStream } from './persistentReducedStream';
import { empty } from 'rxjs';
import { ActionStream } from './types/helpers';

const test = testUntyped as TestInterface<{
  registry: StateStreamRegistry;
  stream: PersistentReducedStateStream<number>;
}>;

const action$: ActionStream = empty();

test.beforeEach((t) => {
  t.context.registry = new StateStreamRegistry();
  t.context.stream = new PersistentReducedStateStream('spiedStream', 1, []);
});

test('stateStreamRegistry.register should throw error for duplicate names', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream as any);
  t.throws(() => registry.register(stream));
});

test('stateStreamRegistry.register should not start streams before startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.register(stream as any);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.startReducing should call startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.register(stream as any);
  registry.startReducing(action$);

  t.deepEqual(spy.firstCall.args, [action$, undefined]);
});

test('stateStreamRegistry.startReducing should error on double call', (t) => {
  const { registry } = t.context;

  registry.startReducing(action$);
  t.throws(() => registry.startReducing(action$));
});

test('stateStreamRegistry.register should start streams after startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');

  registry.startReducing(action$);
  registry.register(stream as any);

  t.deepEqual(spy.firstCall.args, [action$, undefined]);
});

test('stateStreamRegistry.register should not start streams after stopReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');

  registry.startReducing(action$);
  registry.stopReducing();
  registry.register(stream as any);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.startReducing initializes streams with state', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream as any);
  registry.startReducing(action$, new Map([[stream.name, 2]]));

  t.deepEqual(stream.state, 2);
});

test('stateStreamRegistry.stopReducing should call stopReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'stopReducing');
  t.teardown(() => spy.restore());

  registry.register(stream as any);
  registry.startReducing(action$);
  registry.stopReducing();

  t.deepEqual(spy.firstCall.args, []);
});

test('stateStreamRegistry.getState gets the t.context.stream state', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream as any);

  const expectedState = new Map([[stream.name, stream.state]]);
  const actualState = registry.getStates();

  t.deepEqual(actualState, expectedState);
});
