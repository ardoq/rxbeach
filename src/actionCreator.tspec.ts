import { actionCreator } from './actionCreator';

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
