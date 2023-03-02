import test from 'ava';
import { actionCreator } from '../actionCreator';
import { isActionOfType, isValidRxBeachAction } from './helpers';

const actionCreatorWithPayload = actionCreator<string>('[test] with payload');
const actionCreatorWithoutPayload = actionCreator('[test] no payload');

test('isValidRxBeachAction - invalid actions', (t) => {
  const invalidActions = [
    undefined,
    null,
    123,
    '[test] action type',
    () => {
      /* noop */
    },
    actionCreatorWithPayload,
    actionCreatorWithoutPayload,
    {},
    { type: '[test] action type' },
    { type: '[test] action type', meta: {} },
    { type: '[test] action type', payload: {} },
    { meta: {}, payload: {} },
  ];

  for (const action of invalidActions) {
    t.is(isValidRxBeachAction(action), false);
  }
});

test('isValidRxBeachAction - valid actions', (t) => {
  const validActions = [
    { type: '[test] action type', meta: {}, payload: undefined },
    actionCreatorWithPayload('asd'),
    actionCreatorWithoutPayload(),
  ];

  for (const action of validActions) {
    t.is(isValidRxBeachAction(action), true);
  }
});

test('isActionOfType', (t) => {
  t.is(
    isActionOfType(actionCreatorWithPayload, actionCreatorWithPayload('asd')),
    true
  );
  t.is(
    isActionOfType(actionCreatorWithoutPayload, actionCreatorWithoutPayload()),
    true
  );
});
