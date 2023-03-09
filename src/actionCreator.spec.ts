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

// Type assertions

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typeChecks = [
  // accepts results from action creators
  isValidRxBeachAction(actionCreatorWithoutPayload()),
  isValidRxBeachAction(actionCreatorWithPayload('test')),

  // should accept any value as argument
  isValidRxBeachAction(undefined),
  isValidRxBeachAction(null),
  isValidRxBeachAction({}),

  // @ts-expect-error: first argument of isActionOfType should be an action creator
  isActionOfType({}, actionCreatorWithoutPayload()),
  // @ts-expect-error: first argument of isActionOfType should be an action creator
  isActionOfType(1, actionCreatorWithoutPayload()),
  // @ts-expect-error: first argument of isActionOfType should be an action creator
  isActionOfType(null, actionCreatorWithoutPayload()),
  // @ts-expect-error: first argument of isActionOfType should be an action creator
  isActionOfType(undefined, actionCreatorWithoutPayload()),

  // second argument of isActionOfType accepts anything
  isActionOfType(actionCreatorWithoutPayload, actionCreatorWithoutPayload()),
  isActionOfType(actionCreatorWithoutPayload, actionCreatorWithPayload('test')),
  isActionOfType(actionCreatorWithPayload, actionCreatorWithoutPayload()),
  isActionOfType(actionCreatorWithPayload, actionCreatorWithPayload('test')),
  isActionOfType(actionCreatorWithPayload, undefined),
  isActionOfType(actionCreatorWithPayload, null),
  isActionOfType(actionCreatorWithPayload, {}),
];

const actionPairs = [
  [actionCreatorWithPayload, actionCreatorWithPayload('asd')] as const,
  [actionCreatorWithoutPayload, actionCreatorWithoutPayload()] as const,
];

for (const [creatorFn, anAction] of actionPairs) {
  // @ts-expect-error Don't know how to fix this case...
  isActionOfType(creatorFn, anAction);
}

const action1 = actionCreatorWithoutPayload();
if (isActionOfType(actionCreatorWithoutPayload, action1)) {
  // @ts-expect-error Assert that ActionWithoutPayload does not have a payload
  // eslint-disable-next-line no-unused-expressions
  action1.payload;
}
