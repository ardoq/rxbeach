import { OperatorFunction, pipe } from 'rxjs';
import { scan } from 'rxjs/operators';
import {
  VoidPayload,
  UnknownAction,
  UnknownActionCreator,
  UnknownActionCreatorWithPayload,
} from 'rxbeach/internal';
import { ofType } from 'rxbeach/operators';

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload
) => State;

export type ReducerEntry<State, Payload = any> = [
  UnknownActionCreator[],
  Reducer<State, Payload>
];

type ReducerFn = {
  /**
   * Define a reducer for an action with payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @template `Payload` - The payload of the action, fed to the reducer together
   *                       with the state. Should be automatically extracted from
   *                       the `actionCreator` parameter
   * @returns A reducer entry; A tuple array of actions and reducer, for passing
   *          into `combineReducers`
   */
  <State, Payload>(
    actionCreator: UnknownActionCreatorWithPayload<Payload>,
    reducer: Reducer<State, Payload>
  ): ReducerEntry<State, Payload>;

  /**
   * Define a reducer for an action without payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A reducer entry; A tuple array of actions and reducer, for passing
   *          into `combineReducers`
   */
  <State>(
    actionCreator: UnknownActionCreator,
    reducer: Reducer<State, VoidPayload>
  ): ReducerEntry<State, VoidPayload>;

  /**
   * Define a reducer for multiple actions with overlapping payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @template `Payload` - The payload of the action, fed to the reducer together
   *                       with the state. Should be automatically extracted from
   *                       the `actionCreator` parameter
   * @returns A reducer entry; A tuple array of actions and reducer, for passing
   *          into `combineReducers`
   */
  <State, Payload>(
    actionCreator: UnknownActionCreatorWithPayload<Payload>[],
    reducer: Reducer<State, Payload>
  ): ReducerEntry<State, Payload>;

  /**
   * Define a reducer for multiple actions without overlapping payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A reducer entry; A tuple array of actions and reducer, for passing
   *          into `combineReducers`
   */
  <State>(
    actionCreator: UnknownActionCreatorWithPayload<{}>[],
    reducer: Reducer<State, {}>
  ): ReducerEntry<State, {}>;

  /**
   * Define a reducer for multiple actions without payloads
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A reducer entry; A tuple array of actions and reducer, for passing
   *          into `combineReducers`
   */
  <State>(
    actionCreator: UnknownActionCreator[],
    reducer: Reducer<State, VoidPayload>
  ): ReducerEntry<State, VoidPayload>;
};

export const reducer: ReducerFn = <State>(
  actionCreator: UnknownActionCreator | UnknownActionCreator[],
  reducer: Reducer<State, any>
): ReducerEntry<State, unknown> => [
  Array.isArray(actionCreator) ? actionCreator : [actionCreator],
  reducer,
];

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
    reducers.flatMap(([actions, reducer]) =>
      actions.map(action => [action.type, reducer])
    )
  );
  return pipe(
    ofType(...reducers.flatMap(([action]) => action)),
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
