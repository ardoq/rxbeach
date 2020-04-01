import { actionCreator } from './actionCreator';

const booleanAction = actionCreator<boolean>('boolean');
booleanAction(true);
booleanAction(false);

enum Enum {
  A,
  B,
  C,
}
const enumAction = actionCreator<Enum>('enum');
enumAction(Enum.A);
enumAction(Enum.B);
const e: Enum = Enum.C;
enumAction(e);

const unionAction = actionCreator<{} | number>('empty or number');
unionAction({});
unionAction(1);
unionAction(2);

type NumberGenerator = () => number;
type BoolFunc = (a: boolean) => boolean;
const unionFuncAction = actionCreator<NumberGenerator | BoolFunc>('functinos');
unionFuncAction(() => 1);
unionFuncAction((a) => !a);

const voidAction = actionCreator('void');
voidAction();

const nullAction = actionCreator<string | null>('string or null');
nullAction(null);
nullAction('hello');

const undefinedAction = actionCreator<string | undefined>(
  'string or undefined'
);

// undefinedAction(); // Would have thought TS would allow this
undefinedAction(undefined);
undefinedAction('world');

const optionalPayloadAction = actionCreator<string | void>('optional payload');

optionalPayloadAction();
optionalPayloadAction('payload');
