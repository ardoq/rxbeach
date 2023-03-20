import {
  actionCreator,
  isActionOfType,
  isValidRxBeachAction,
} from './actionCreator';

const booleanAction = actionCreator<boolean>('[test] boolean');
booleanAction(true);
booleanAction(false);

enum Enum {
  A,
  B,
  C,
}
const enumAction = actionCreator<Enum>('[test] enum');
enumAction(Enum.A);
enumAction(Enum.B);
const e: Enum = Enum.C;
enumAction(e);

const unionAction = actionCreator<Record<string, unknown> | number>(
  '[test] empty or number'
);
unionAction({});
unionAction(1);
unionAction(2);

type NumberGenerator = () => number;
type BoolFunc = (a: boolean) => boolean;
const unionFuncAction = actionCreator<NumberGenerator | BoolFunc>(
  '[test] functions'
);
unionFuncAction(() => 1);
unionFuncAction((a) => !a);

const voidAction = actionCreator('[test] void');
voidAction();

const nullAction = actionCreator<string | null>('[test] string or null');
nullAction(null);
nullAction('hello');

const undefinedAction = actionCreator<string | undefined>(
  '[test] string or undefined'
);

// undefinedAction(); // Would have thought TS would allow this
undefinedAction(undefined);
undefinedAction('world');

const optionalPayloadAction = actionCreator<string | void>(
  '[test] optional payload'
);

optionalPayloadAction();
optionalPayloadAction('payload');

const actionCreatorWithPayload = actionCreator<string>('[test] with payload');
const actionCreatorWithoutPayload = actionCreator('[test] no payload');

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
  isNonNullish(action1.payload);
}

// eslint-disable-next-line @typescript-eslint/ban-types
const isNonNullish = (x: {}) => {
  /* no-op */
};

const testIsActionOfType = (action: any) => {
  if (!isValidRxBeachAction(action)) {
    return;
  }

  if (isActionOfType(actionCreatorWithPayload, action)) {
    return isNonNullish(action.payload);
  }

  if (isActionOfType(actionCreatorWithoutPayload, action)) {
    // @ts-expect-error should not have payload
    return isNonNullish(action.payload);
  }

  isNonNullish(action.type);
};
