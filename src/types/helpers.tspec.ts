import { AssertTrue, IsExact } from 'conditional-type-checks';
import { ActionCreatorWithPayload } from './ActionCreator';
import { ExtractPayload } from './helpers';

type Payload = { foo: number };
type ExtractPayload_extracts_payload = AssertTrue<
  IsExact<ExtractPayload<ActionCreatorWithPayload<Payload>>, Payload>
>;
