# Reducers

Reducers specify how the application’s state changes in response to actions sent to the store. Remember that actions only describe /what happened/, but don’t describe how the application’s state changes.

## Designing the state shape

The reducer will separate the data from the view. The goal is to keep a tidy state that only reflects what is needed for the view. A default state is defined and initially applied when the reducer is loaded. Nesting of data in the reducer is not advised, this to keep the complexity at a minimum.


```typescript
export type CalculatedFieldOptionsState = CalculatedFieldOption[];

export const defaultState = [] as CalculatedFieldOptionsState;
```

## Handling Actions

Reducers are pure functions, where the return value is only determined by its input value. It’s very important that the reducer stays pure. Given the same arguments, it should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Just a calculation. An action that is connected to the reducer has a one-to-one relation with a reducer, and is only associated with a single reducer (right?).


We will use predefined types of the reducer function and the action:
```typescript
// streams/types
export type Reducer<StateShape, Payload = any> = (
  state: StateShape,
  payload: Payload
) => StateShape;

// actions/utils
export type ActionType = symbol;
```

We write types of the reducers state, and actions that will trigger a change of the reducer:
```typescript
// ./types
export interface CalculatedFieldOption extends LabeledValue<string> {
  ids: string[];
}

// ./actions
export const FETCH_CALCULATED_FIELD_OPTIONS = Symbol(
  'FETCH_CALCULATED_FIELD_OPTIONS'
);
export const fetchCalculatedFieldOptions = createAction<
  PayloadFetchCalculatedFieldOptions
>(FETCH_CALCULATED_FIELD_OPTIONS);
```

Then we can set up the reducer: 
```typescript
import { Reducer } from 'streams/types';
import { ActionType } from 'actions/utils';
import {
  PayloadUpdateCalculatedFieldOptions,
  UPDATE_CALCULATED_FIELD_OPTIONS,
} from './actions';
import { CalculatedFieldOption } from './types';

export type CalculatedFieldOptionsState = CalculatedFieldOption[];

type CalculatedFieldOptionsReducer<Payload = any> = Reducer<
  CalculatedFieldOptionsState,
  Payload
>;

export const defaultState = [] as CalculatedFieldOptionsState;

const handleUpdateParameterOptions: CalculatedFieldOptionsReducer<
  PayloadUpdateCalculatedFieldOptions
> = (state, { calculatedFieldOptions }) => calculatedFieldOptions;

const reducers = new Map<ActionType, CalculatedFieldOptionsReducer>([
  [UPDATE_CALCULATED_FIELD_OPTIONS, handleUpdateParameterOptions],
]);

export default reducers;
```


## Reducer $treams
The reducer stream listens to the `action$` stream and filters through certain actions based on an *id* (and a qualitifier id?).  A match will in turn update the reducer, and notify the listeners of the stream of the new state.

* Reducer streams should always use `theshareReplay({bufferSize: 1, refCount: true})`operator so that:
  * Subscribers can get it’s latest value
  * A value is only produced once
  * All subscribers observe the same value
  * If all subscribers unsubscribe, the stream completes and will “restart” for future subscribers
* Global reducer streams should be registered and subscribed somewhere central