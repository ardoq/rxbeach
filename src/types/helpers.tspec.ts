import { AssertTrue, IsExact } from 'conditional-type-checks';
import { ActionCreator, ActionCreatorWithPayload } from './ActionCreator';
import { ExtractPayload, InferPayloadFromActionCreator } from './helpers';

type Payload = { foo: number };
type VoidFn = () => void;

type ExtractPayload_extracts_payload = AssertTrue<
  IsExact<ExtractPayload<ActionCreatorWithPayload<Payload>>, Payload>
>;
type ExtractPayload_extracts_payload2 = AssertTrue<
  IsExact<ExtractPayload<ActionCreatorWithPayload>, void>
>;
// type aaa = ExtractPayload<VoidFn>; // weakness of ExtractPayload
// type aaa3 = ExtractPayload<unknown>; // weakness of ExtractPayload

type InferPayloadFromActionCreator_extracts_payload = AssertTrue<
  IsExact<InferPayloadFromActionCreator<ActionCreator<Payload>>, Payload>
>;
type InferPayloadFromActionCreator_extracts_void_payload = AssertTrue<
  IsExact<InferPayloadFromActionCreator<ActionCreator>, void>
>;
type InferPayloadFromActionCreator_handles_bad_input = AssertTrue<
  IsExact<InferPayloadFromActionCreator<VoidFn>, never>
>;
type InferPayloadFromActionCreator_handles_bad_input_2 = AssertTrue<
  IsExact<InferPayloadFromActionCreator<2>, never>
>;
type InferPayloadFromActionCreator_handles_unknown = AssertTrue<
  IsExact<InferPayloadFromActionCreator<unknown>, never>
>;
type InferPayloadFromActionCreator_handles_void = AssertTrue<
  IsExact<InferPayloadFromActionCreator<void>, never>
>;
