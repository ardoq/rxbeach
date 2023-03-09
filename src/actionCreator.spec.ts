import test from 'ava';
import {
  actionCreator,
  isActionOfType,
  isValidRxBeachAction,
} from './actionCreator';

type Payload = { num: number };
const myAction = actionCreator<Payload>('[test] three');
const action = myAction({ num: 3 }) as {
  type: string;
  payload: Payload;
  meta: { namespace?: string };
};
type AlternativePayload = { text: string };
const unionAction = actionCreator<Payload | AlternativePayload>('[test] union');
const union1 = unionAction({ num: 4 });
const union2 = unionAction({ text: 'hi' });

test('actionCreator should create action creators and append the type', (t) => {
  t.is(action.type, myAction.type);
  t.deepEqual(action.payload, { num: 3 });
});
test('actionCreator should protect the type field', (t) => {
  t.throws(
    () => {
      (myAction as any).type = 'lol';
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with the payload', (t) => {
  t.deepEqual(action.payload, { num: 3 });
  t.deepEqual(union1.payload, { num: 4 });
  t.deepEqual(union2.payload, { text: 'hi' });
});
test('actionCreator should create action objects with protected type', (t) => {
  t.throws(
    () => {
      action.type = 'mock';
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with protected meta', (t) => {
  t.throws(
    () => {
      action.meta = {};
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with protected namespace', (t) => {
  t.throws(
    () => {
      action.meta.namespace = 'shim';
    },
    { instanceOf: TypeError }
  );
});

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

  for (const invalidAction of invalidActions) {
    t.is(isValidRxBeachAction(invalidAction), false);
  }
});

test('isValidRxBeachAction - valid actions', (t) => {
  const validActions = [
    { type: '[test] action type', meta: {}, payload: undefined },
    actionCreatorWithPayload('asd'),
    actionCreatorWithoutPayload(),
  ];

  for (const validAction of validActions) {
    t.is(isValidRxBeachAction(validAction), true);
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
