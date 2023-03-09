// import sinon from 'sinon';
import { StateStreamRegistry } from './stateStreamRegistry';
import { ObservableState } from './observableState';
import { EMPTY } from 'rxjs';

let cleanupFns: VoidFunction[] = [];
afterEach(() => {
  cleanupFns.forEach((cleanupFn) => cleanupFn());
  cleanupFns = [];
});

let registry = new StateStreamRegistry();
let stream = new ObservableState<number>('spiedStream', EMPTY, 1);

beforeEach(() => {
  registry = new StateStreamRegistry();
  stream = new ObservableState<number>('spiedStream', EMPTY, 1);
});

test('stateStreamRegistry.register should throw error for duplicate names', () => {
  registry.register(stream);
  expect(() => registry.register(stream)).toThrow();
});

test('stateStreamRegistry.register should throw error for duplicate name after start', () => {
  registry.register(stream);
  registry.startReducing();

  expect(() => registry.register(stream)).toThrow();
});

test('stateStreamRegistry.register should not start streams before startReducing', () => {
  const spy = jest.spyOn(stream, 'connect');
  cleanupFns.push(() => spy.mockReset());

  registry.register(stream);

  expect(spy).not.toHaveBeenCalled();
});

test('stateStreamRegistry.startReducing should call connect', () => {
  const spy = jest.spyOn(stream, 'connect');
  cleanupFns.push(() => spy.mockReset());

  registry.register(stream);
  registry.startReducing();

  expect(spy).toHaveBeenCalled();
});

test('stateStreamRegistry.startReducing should error on double call', () => {
  registry.startReducing();
  expect(() => registry.startReducing()).toThrow();
});

test('stateStreamRegistry.register should start streams after startReducing', () => {
  const spy = jest.spyOn(stream, 'connect');
  cleanupFns.push(() => spy.mockReset());

  registry.startReducing();
  registry.register(stream);

  expect(spy).toHaveBeenCalled();
});

test('stateStreamRegistry.register should not start streams after stopReducing', () => {
  const spy = jest.spyOn(stream, 'connect');
  cleanupFns.push(() => spy.mockReset());

  registry.startReducing();
  registry.stopReducing();
  registry.register(stream);

  expect(spy).not.toHaveBeenCalled();
});

test('stateStreamRegistry.stopReducing should call unsubscribe', () => {
  const spy = jest.spyOn(stream, 'unsubscribe');
  cleanupFns.push(() => spy.mockReset());

  registry.register(stream);
  registry.startReducing();
  registry.stopReducing();

  expect(spy).toHaveBeenCalled();
});
