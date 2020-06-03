import sinon from 'sinon';
import testUntyped, { TestInterface } from 'ava';
import { StateStreamRegistry } from './stateStreamRegistry';
import { PersistentReducedStateStream } from './persistentReducedStateStream';
import { empty } from 'rxjs';
import { ActionStream } from './types/helpers';

const test = testUntyped as TestInterface<{
  registry: StateStreamRegistry;
  stream: PersistentReducedStateStream<number>;
  reloadedStream: PersistentReducedStateStream<number>;
}>;

const action$: ActionStream = empty();

test.beforeEach((t) => {
  t.context.registry = new StateStreamRegistry();
  t.context.stream = new PersistentReducedStateStream('spiedStream', 1, []);
  t.context.reloadedStream = new PersistentReducedStateStream(
    t.context.stream.name,
    2,
    []
  );
});

test('stateStreamRegistry.register should throw error for duplicate names', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream);
  t.throws(() => registry.register(stream));
});

test('stateStreamRegistry.register should throw error for duplicate name after start in prod', (t) => {
  const { registry, stream } = t.context;

  process.env.NODE_ENV = 'production';
  registry.register(stream);
  registry.startReducing(action$);

  t.throws(() => registry.register(stream));
});

test('stateStreamRegistry.register should call replace for duplicate name after start when not prod', (t) => {
  const { registry, stream, reloadedStream } = t.context;
  const spy = sinon.spy(registry, 'replace');
  t.teardown(() => spy.restore());

  process.env.NODE_ENV = 'test';
  registry.register(stream);
  registry.startReducing(action$);
  registry.register(reloadedStream);

  t.deepEqual(spy.firstCall.args, [stream as any, reloadedStream]);
});

test('stateStreamRegistry.register should not start streams before startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.register(stream);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.startReducing should call startReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.register(stream);
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
  t.teardown(() => spy.restore());

  registry.startReducing(action$);
  registry.register(stream);

  t.deepEqual(spy.firstCall.args, [action$, undefined]);
});

test('stateStreamRegistry.register should not start streams after stopReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.startReducing(action$);
  registry.stopReducing();
  registry.register(stream);

  t.assert(spy.notCalled);
});

test('stateStreamRegistry.replace should stop the old stream', (t) => {
  const { registry, stream } = t.context;
  const newStream = new PersistentReducedStateStream(stream.name, 12, []);
  const spy = sinon.spy(stream, 'stopReducing');
  t.teardown(() => spy.restore());

  registry.register(stream);
  registry.startReducing(action$);
  registry.replace(stream, newStream);

  t.assert(spy.called);
});

test('stateStreamRegistry.replace should register and start the new stream', (t) => {
  const { registry, stream } = t.context;
  const newStream = new PersistentReducedStateStream(stream.name, 12, []);
  const spy = sinon.spy(newStream, 'startReducing');
  t.teardown(() => spy.restore());

  registry.register(stream);
  registry.startReducing(action$);
  registry.replace(stream, newStream);

  t.is(registry.streams.get(stream.name), newStream);
  t.deepEqual(newStream.state, 1);
  t.assert(spy.called);
});

test('stateStreamRegistry.startReducing initializes streams with state', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream);
  registry.startReducing(action$, new Map([[stream.name, 2]]));

  t.deepEqual(stream.state, 2);
});

test('stateStreamRegistry.stopReducing should call stopReducing', (t) => {
  const { registry, stream } = t.context;
  const spy = sinon.spy(stream, 'stopReducing');
  t.teardown(() => spy.restore());

  registry.register(stream);
  registry.startReducing(action$);
  registry.stopReducing();

  t.deepEqual(spy.firstCall.args, []);
});

test('stateStreamRegistry.getState gets the t.context.stream state', (t) => {
  const { registry, stream } = t.context;

  registry.register(stream);

  const expectedState = new Map([[stream.name, stream.state]]);
  const actualState = registry.getStates();

  t.deepEqual(actualState, expectedState);
});
