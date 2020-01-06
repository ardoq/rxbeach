import { AssertTrue, IsExact } from 'conditional-type-checks';
import { ActionCreatorWithPayload, ExtractPayload } from 'rxbeach';

type Payload = { foo: number };
type ExtractPayload_extracts_payload = AssertTrue<
  IsExact<ExtractPayload<ActionCreatorWithPayload<Payload>>, Payload>
>;
