import test from 'ava';
import { incrementMocks } from './internal/testing/mock';
import { action$, dispatchAction } from './action$';
import { take } from 'rxjs/operators';
import { _namespaceAction } from './namespace';
import { ActionWithoutPayload } from './types/Action';

const actions = incrementMocks.marbles.actions;

test('dispatchAction makes action$ emit', (t) => {
  let lastAction: ActionWithoutPayload | undefined;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  t.teardown(() => sub.unsubscribe());

  dispatchAction(actions[1]);
  t.is(lastAction, actions[1]);
});

test('dispatchAction does not remove existing namespace', (t) => {
  let lastAction: ActionWithoutPayload | undefined;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  t.teardown(() => sub.unsubscribe());

  dispatchAction(actions.n);
  t.is(lastAction, actions.n);
});

test('dispatchAction replaces namespace', (t) => {
  let lastAction;
  const sub = action$.pipe(take(1)).subscribe((a) => (lastAction = a));
  t.teardown(() => sub.unsubscribe());

  dispatchAction(actions.n, 'foo');
  t.notDeepEqual(lastAction, actions.n);
  t.deepEqual(lastAction, _namespaceAction('foo', actions.n));
});
