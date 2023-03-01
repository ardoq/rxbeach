import { AssertTrue, IsExact } from 'conditional-type-checks';
import { actionCreator } from '../actionCreator';
import { ActionCreatorWithPayload } from './ActionCreator';
import {
  ExtractPayload,
  isActionOfType,
  isValidRxBeachAction,
} from './helpers';

type Payload = { foo: number };
type ExtractPayload_extracts_payload = AssertTrue<
  IsExact<ExtractPayload<ActionCreatorWithPayload<Payload>>, Payload>
>;

const actionCreatorWithPayload = actionCreator<string>('[test] with payload');
const actionCreatorWithoutPayload = actionCreator('[test] no payload');

isValidRxBeachAction(actionCreatorWithoutPayload());
isValidRxBeachAction(actionCreatorWithPayload('test'));
isValidRxBeachAction(undefined);
isValidRxBeachAction(null);
isValidRxBeachAction({});

isActionOfType(actionCreatorWithoutPayload, actionCreatorWithoutPayload());
isActionOfType(actionCreatorWithPayload, actionCreatorWithPayload('test'));
isActionOfType(actionCreatorWithPayload, undefined);
isActionOfType(actionCreatorWithPayload, null);
isActionOfType(actionCreatorWithPayload, {});

const actionPairs = [
  [actionCreatorWithPayload, actionCreatorWithPayload('asd')] as const,
  [actionCreatorWithoutPayload, actionCreatorWithoutPayload()] as const,
];

for (const [creatorFn, action] of actionPairs) {
  // @ts-expect-error Don't know how to fix this case...
  isActionOfType(creatorFn, action);
}

const action = actionCreatorWithoutPayload();
if (isActionOfType(actionCreatorWithoutPayload, action)) {
  // @ts-expect-error
  action.payload;
}
