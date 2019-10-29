import { OperatorFunction, pipe } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ActionCreator } from 'rxbeach';
import { VoidPayload, AnyAction, UnknownAction } from 'rxbeach/internal';
import { ofType, ofTypes } from 'rxbeach/operators';
import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
} from './types/ActionCreator';

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload
) => State;

type ReducerEntry<State, Payload> = [string, Reducer<State, Payload>];

// Typescript is not so great with conditional types (ActionCreator) yet, so we
// need to overload for each case
/**
 * Create a reducer entry for passing into `combineReducers`
 *
 * This function doesn't alter the passed the reducer, but serves as a nice way
 * of typing it.
 *
 * @param actionCreator The action creator to assign this reducer to and extract
 *                      payload type from
 * @param reducer The reducer function
 * @template `State` - The state the reducer reduces to
 * @returns A reducer entry; A tuple array of action type and reducer, for
 *          passing into `combineReducers`
 *
 * @see combineReducers
 */
export function reducer<State>(
  actionCreator: ActionCreatorWithoutPayload,
  reducer: Reducer<State, VoidPayload>
): ReducerEntry<State, VoidPayload>;
/**
 * Create a reducer entry for passing into `combineReducers`
 *
 * This function doesn't alter the passed the reducer, but serves as a nice way
 * of typing it.
 *
 * **NB!** If you need void payload, just skip the second type argument
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
export function reducer<State, Payload>(
  actionCreator: ActionCreatorWithPayload<Payload>,
  reducer: Reducer<State, Payload>
): ReducerEntry<State, Payload>;
/**
 * Untyped version. Your IDE should show you docs for the appropriate overload
 */
export function reducer<State, Payload>(
  actionCreator: ActionCreator<Payload>,
  reducer: Reducer<State, Payload>
): ReducerEntry<State, Payload> {
  return [actionCreator.type, reducer];
}

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
  ...reducers: ReducerEntry<State, any>[]
): OperatorFunction<AnyAction, State> => {
  const reducerMap = new Map(reducers);
  return pipe(
    ofTypes(...reducerMap.keys()),
    scan((state: State, { type, payload }: UnknownAction) => {
      const reducer = reducerMap.get(type);
      if (reducer) {
        try {
          return reducer(state, payload);
        } catch (_) {
          return state;
        }
      } else {
        return state;
      }
    }, seed)
  );
};
