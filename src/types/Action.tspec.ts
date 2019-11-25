import { IsExact, AssertTrue, Has, AssertFalse } from 'conditional-type-checks';
import { ActionWithPayload, ActionWithoutPayload, Action } from 'rxbeach';

type ActionWithPayload_extends_ActionWithoutPayload = AssertTrue<
  Has<ActionWithPayload<unknown>, ActionWithoutPayload>
>;

type Action_dispatches_to_ActionWithPayload = AssertTrue<
  IsExact<Action<string>, ActionWithPayload<string>>
>;
type Action_dispatches_to_ActionWithoutPayload = AssertTrue<
  IsExact<Action, ActionWithoutPayload>
>;

// Typescript does expansion of union types when they are generic arguments to
// conditional types. This means that `Action<boolean>` is not the same as
// `ActionWithPayload<boolean>`, but `ActionWithPayload<true> | ActionWithPayload<false>`
// This is not what we want for RxBeach, but here we at least document how TS
// actually treats union types for actions.

type Action_expands_union_types1a = AssertTrue<
  IsExact<Action<boolean>, ActionWithPayload<true> | ActionWithPayload<false>>
>;
type Action_expands_union_types1b = AssertFalse<
  // This is how we would like it to work
  IsExact<Action<boolean>, ActionWithPayload<boolean>>
>;

type Action_expands_union_types2a = AssertTrue<
  IsExact<Action<Enum>, ActionWithPayload<Enum.A> | ActionWithPayload<Enum.B>>
>;
type Action_expands_union_types2b = AssertFalse<
  // This is how we would like it to work
  IsExact<Action<Enum>, ActionWithPayload<Enum>>
>;

type Action_Expands_union_types3a = AssertTrue<
  IsExact<Action<Foo | Bar>, ActionWithPayload<Foo> | ActionWithPayload<Bar>>
>;
type Action_Expands_union_types3b = AssertFalse<
  // This is how we would like it to work
  IsExact<Action<Foo | Bar>, ActionWithPayload<Foo | Bar>>
>;

enum Enum {
  A,
  B,
}
type Foo = { foo: number };
type Bar = { bar: string };
