import { Routine, routine } from '../routines';
import { actionCreator } from '../actionCreator';
import { extractPayload, ofType } from './operators';
import { AssertTrue, Has } from 'conditional-type-checks';

const stringRoutine = routine(
  ofType(actionCreator<string>('[test] simple string')),
  extractPayload()
);
type StringRoutine = AssertTrue<Has<typeof stringRoutine, Routine<string>>>;

type Overlap = { b: boolean };
type Left = { a: number } & Overlap;
type Right = Overlap & { c: symbol };

const inferredOverlapRoutine = routine(
  ofType(
    actionCreator<Overlap>('[test] overlap'),
    actionCreator<Right>('[test] right')
  ),
  extractPayload()
);
type InferredOverlapRoutine = AssertTrue<
  Has<typeof inferredOverlapRoutine, Routine<Overlap>>
>;

const notInferredOverlapRoutine = routine(
  ofType(
    actionCreator<Left>('[test] left'),
    actionCreator<Right>('[test] right')
  ),
  extractPayload()
);
type NotInferredOverlapRoutine = AssertTrue<
  Has<typeof notInferredOverlapRoutine, Routine<any>>
>;

const hintedInferredOverlapRoutine = routine(
  ofType<Overlap>(
    actionCreator<Left>('[test] left'),
    actionCreator<Right>('[test] right')
  ),
  extractPayload()
);
type HintedInferredOverlapRoutine = AssertTrue<
  Has<typeof hintedInferredOverlapRoutine, Routine<Overlap>>
>;

const unionRoutine = routine(
  ofType(actionCreator<string | number>('[test] string or number')),
  extractPayload()
);
type UnionRoutine = AssertTrue<
  Has<typeof unionRoutine, Routine<string | number>>
>;

const optionalPayloadRoutine = routine(
  ofType(actionCreator<string | void>('[test] optional string')),
  extractPayload()
);
type OptionalPayloadRoutine = AssertTrue<
  Has<typeof optionalPayloadRoutine, Routine<string | void>>
>;
