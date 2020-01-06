import { OperatorFunction, pipe } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ActionCreator } from 'rxbeach';
import {
  VoidPayload,
  UnknownAction,
  UnknownActionCreator,
} from 'rxbeach/internal';
import { ofType } from 'rxbeach/operators';

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload
) => State;

export type ReducerEntry<State, Payload = any> = [
  UnknownActionCreator,
  Reducer<State, Payload>
];

/**
 * Create a reducer entry for passing into `combineReducers`
 *
 * @param actionCreator The action creator to assign this reducer to and extract
 *                      payload type from
 * @param reducer The reducer function
 * @template `State` - The state the reducer reduces to
 * @template `Payload` - The payload of the action, fed to the reducer together
 *                       with the state. Should be automatically extracted from
 *                       the `actionCreator` parameter
 * @returns A reducer entry; A tuple array of action type and reducer, for
 *          passing into `combineReducers`
 *
 * @see combineReducers
 */
export const reducer = <State, Payload = VoidPayload>(
  actionCreator: ActionCreator<Payload>,
  reducer: Reducer<State, Payload>
): ReducerEntry<State, Payload> => {
  return [actionCreator, reducer];
};

/**
 * Combine reducer entries into a stream operator
 *
 * The payload of each incoming action is applied to the matching reducers
 * together with the previous state (or the seed if it's the first invocation),
 * and the returned state is emitted.
 *
 * This operator does not change whether the stream is hot or cold.
 *
 * @param seed The initial input to the first reducer call
 * @param reducers The reducer entries that should be combined
 */
export const combineReducers = <State>(
  seed: State,
  reducers: ReducerEntry<State, any>[]
): OperatorFunction<UnknownAction, State> => {
  const reducersByActionType = new Map(
    reducers.map(([action, reducer]) => [action.type, reducer])
  );
  return pipe(
    ofType(...reducers.map(([action]) => action)),
    scan((state, { type, payload }: UnknownAction) => {
      const reducer = reducersByActionType.get(type);
      if (reducer === undefined) {
        // This shouldn't be possible
        return state;
      }

      return reducer(state, payload);
    }, seed)
  );
};
