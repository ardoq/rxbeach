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

export type RegisteredReducer<State, Payload = any> = Reducer<
  State,
  Payload
> & {
  trigger: {
    actions: UnknownActionCreator[];
  };
};

type ReducerCreator = {
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
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State, Payload>(
    actionCreator: UnknownActionCreatorWithPayload<Payload>,
    reducer: Reducer<State, Payload>
  ): RegisteredReducer<State, Payload>;

  /**
   * Define a reducer for an action without payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State>(
    actionCreator: UnknownActionCreator,
    reducer: Reducer<State, VoidPayload>
  ): RegisteredReducer<State, VoidPayload>;

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
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State, Payload>(
    actionCreator: UnknownActionCreatorWithPayload<Payload>[],
    reducer: Reducer<State, Payload>
  ): RegisteredReducer<State, Payload>;

  /**
   * Define a reducer for multiple actions without overlapping payload
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State>(
    actionCreator: UnknownActionCreatorWithPayload<{}>[],
    reducer: Reducer<State, {}>
  ): RegisteredReducer<State, {}>;

  /**
   * Define a reducer for multiple actions without payloads
   *
   * @see combineReducers
   * @param actionCreator The action creator to assign this reducer to and
   *                      extract payload type from
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State>(
    actionCreator: UnknownActionCreator[],
    reducer: Reducer<State, VoidPayload>
  ): RegisteredReducer<State, VoidPayload>;
};

export const reducer: ReducerCreator = <State>(
  actionCreator: UnknownActionCreator | UnknownActionCreator[],
  reducerFn: Reducer<State, any>
): RegisteredReducer<State, unknown> => {
  const wrapper = (state: State, payload: any) => reducerFn(state, payload);
  wrapper.trigger = {
    actions: Array.isArray(actionCreator) ? actionCreator : [actionCreator],
  };
  return wrapper;
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
  reducers: RegisteredReducer<State, any>[]
): OperatorFunction<UnknownAction, State> => {
  const reducersByActionType = new Map(
    reducers.flatMap(reducerFn =>
      reducerFn.trigger.actions.map(action => [action.type, reducerFn])
    )
  );
  return pipe(
    ofType(...reducers.flatMap(reducerFn => reducerFn.trigger.actions)),
    scan((state, { type, payload }: UnknownAction) => {
      const RegisteredReducer = reducersByActionType.get(type);
      if (RegisteredReducer === undefined) {
        // This shouldn't be possible
        return state;
      }

      return RegisteredReducer(state, payload);
    }, seed)
  );
};
