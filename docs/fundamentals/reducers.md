# Reducers

Reducers specify how the application’s state changes in response to actions sent
to the store. Remember that actions only describe _what happened_, but don’t
describe how the application’s state changes.

Reducers generates a state by reducing over the stream of actions.

## Designing the state shape

Reducers are most often used to provide data for a view. The reducer will
separate the data from the view. The goal is to keep a tidy state that only
reflects what is needed for the view. A default state is defined and initially
applied when the reducer is loaded. Nesting of data in the reducer is not
advised, this to keep the complexity at a minimum.

An example of the state from calculated field options:

```typescript
export interface CalculatedFieldOption extends LabeledValue<string> {
  ids: string[];
}
export type CalculatedFieldOptionsState = CalculatedFieldOption[];
export const defaultState = [] as CalculatedFieldOptionsState;
```

## Handling Actions

Reducers are pure functions, where the return value is only determined by its
input value. It’s very important that the reducer stays pure. Given the same
arguments, it should calculate the next state and return it. No surprises. No
side effects. No API calls. No mutations. Just a calculation. An action that is
connected to the reducer has a one-to-one relation with a reducer, and is only
associated with a single reducer. To enforce this, a reducer declaration is
also the action declaration for the action that reducer will react to.

We write types of the reducers state, and define the reducer-action:

```typescript
// ./actions
const setCalculatedFieldOptions = reducer<
  CalculatedFieldOptionsState,
  CalculatedFieldOption[]
>(
  (, options) => options
);

export const reducers = combineReducers(defaultState, setCalculatedFieldOptions);
```

## Reducer \$treams

The reducer stream listens to the `action$` stream (possibly a derived action\$)
and filters through certain actions based on the action types. A match will in
turn update the reducer, and notify the listeners of the stream of the new state.

- Reducer streams should always be so that:
  - Subscribers can get the latest value on subscription
  - A value is only produced once
  - All subscribers observe the same value
  - If all subscribers unsubscribe, the stream completes and will
    “restart” for future subscribers
- Global reducer streams should be registered and subscribed somewhere central
