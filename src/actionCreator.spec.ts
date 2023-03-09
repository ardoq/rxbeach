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

test('actionCreator should create action creators and append the type', () => {
  expect(action.type).toBe(myAction.type);
  expect(action.payload).toEqual({ num: 3 });
});
test('actionCreator should protect the type field', () => {
  expect(() => {
    (myAction as any).type = 'lol';
  }).toThrow(TypeError);
});
test('actionCreator should create action objects with the payload', () => {
  expect(action.payload).toEqual({ num: 3 });
  expect(union1.payload).toEqual({ num: 4 });
  expect(union2.payload).toEqual({ text: 'hi' });
});
test('actionCreator should create action objects with protected type', () => {
  expect(() => {
    action.type = 'mock';
  }).toThrow(TypeError);
});
test('actionCreator should create action objects with protected meta', () => {
  expect(() => {
    action.meta = {};
  }).toThrow(TypeError);
});
test('actionCreator should create action objects with protected namespace', () => {
  expect(() => {
    action.meta.namespace = 'shim';
  }).toThrow(TypeError);
});

const actionCreatorWithPayload = actionCreator<string>('[test] with payload');
const actionCreatorWithoutPayload = actionCreator('[test] no payload');

test('isValidRxBeachAction - invalid actions', () => {
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
    expect(isValidRxBeachAction(invalidAction)).toBe(false);
  }
});

test('isValidRxBeachAction - valid actions', () => {
  const validActions = [
    { type: '[test] action type', meta: {}, payload: undefined },
    actionCreatorWithPayload('asd'),
    actionCreatorWithoutPayload(),
  ];

  for (const validAction of validActions) {
    expect(isValidRxBeachAction(validAction)).toBe(true);
  }
});

test('isActionOfType', () => {
  expect(
    isActionOfType(actionCreatorWithPayload, actionCreatorWithPayload('asd'))
  ).toBe(true);
  expect(
    isActionOfType(actionCreatorWithoutPayload, actionCreatorWithoutPayload())
  ).toBe(true);
});

// Type assertions

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const typeChecks = [
//   // accepts results from action creators
//   isValidRxBeachAction(actionCreatorWithoutPayload()),
//   isValidRxBeachAction(actionCreatorWithPayload('test')),

//   // should accept any value as argument
//   isValidRxBeachAction(undefined),
//   isValidRxBeachAction(null),
//   isValidRxBeachAction({}),

//   // @ts-expect-error: first argument of isActionOfType should be an action creator
//   isActionOfType({}, actionCreatorWithoutPayload()),
//   // @ts-expect-error: first argument of isActionOfType should be an action creator
//   isActionOfType(1, actionCreatorWithoutPayload()),
//   // @ts-expect-error: first argument of isActionOfType should be an action creator
//   isActionOfType(null, actionCreatorWithoutPayload()),
//   // @ts-expect-error: first argument of isActionOfType should be an action creator
//   isActionOfType(undefined, actionCreatorWithoutPayload()),

//   // second argument of isActionOfType accepts anything
//   isActionOfType(actionCreatorWithoutPayload, actionCreatorWithoutPayload()),
//   isActionOfType(actionCreatorWithoutPayload, actionCreatorWithPayload('test')),
//   isActionOfType(actionCreatorWithPayload, actionCreatorWithoutPayload()),
//   isActionOfType(actionCreatorWithPayload, actionCreatorWithPayload('test')),
//   isActionOfType(actionCreatorWithPayload, undefined),
//   isActionOfType(actionCreatorWithPayload, null),
//   isActionOfType(actionCreatorWithPayload, {}),
// ];

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
