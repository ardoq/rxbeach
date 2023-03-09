import { incrementMocks } from './internal/testing/mock';
import { action$, dispatchAction } from './action$';
import { take } from 'rxjs/operators';
import { _namespaceAction } from './namespace';
import { ActionWithoutPayload } from './types/Action';

const actions = incrementMocks.marbles.actions;

let cleanupFns: VoidFunction[] = [];
afterEach(() => {
  cleanupFns.forEach((cleanupFn) => cleanupFn());
  cleanupFns = [];
});

test('dispatchAction makes action$ emit', () => {
  let lastAction: ActionWithoutPayload | undefined;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  cleanupFns.push(() => sub.unsubscribe());

  dispatchAction(actions[1]);
  expect(lastAction).toBe(actions[1]);
});

test('dispatchAction does not remove existing namespace', () => {
  let lastAction: ActionWithoutPayload | undefined;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  cleanupFns.push(() => sub.unsubscribe());

  dispatchAction(actions.n);
  expect(lastAction).toBe(actions.n);
});

test('dispatchAction replaces namespace', () => {
  let lastAction;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  cleanupFns.push(() => sub.unsubscribe());

  dispatchAction(actions.n, 'foo');
  expect(lastAction).not.toEqual(actions.n);
  expect(lastAction).toEqual(_namespaceAction('foo', actions.n));
});
