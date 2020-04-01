import { OperatorFunction, pipe, Observable, Subject } from 'rxjs';
import { scan, map, filter } from 'rxjs/operators';
import {
  VoidPayload,
  UnknownAction,
  UnknownActionCreator,
  UnknownActionCreatorWithPayload,
} from './internal/types';
import { defaultErrorSubject } from './internal/defaultErrorSubject';
import { ofType } from './operators/operators';
import { merge } from './operators/decorated';

const wrapInArray = <T>(val: T | T[]): T[] =>
  Array.isArray(val) ? val : [val];

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload
) => State;

type RegisteredActionReducer<State, Payload = any> = Reducer<State, Payload> & {
  trigger: {
    actions: UnknownActionCreator[];
  };
};
type RegisteredStreamReducer<State, Payload = any> = Reducer<State, Payload> & {
  trigger: {
    source$: Observable<Payload>;
  };
};

export type RegisteredReducer<State, Payload = any> = Reducer<
  State,
  Payload
> & {
  trigger:
    | {
        actions: UnknownActionCreator[];
      }
    | {
        source$: Observable<Payload>;
      };
};

const isActionReducer = <State, Payload>(
  reducerFn: RegisteredReducer<State, Payload>
): reducerFn is RegisteredActionReducer<State, Payload> =>
  'actions' in reducerFn.trigger;

const isStreamReducer = <State, Payload>(
  reducerFn: RegisteredReducer<State, Payload>
): reducerFn is RegisteredStreamReducer<State, Payload> =>
  'source$' in reducerFn.trigger;

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

  /**
   * Define a reducer for a stream
   *
   * @see combineReducers
   * @param source$ The stream which will trigger this reducer
   * @param reducer The reducer function
   * @template `State` - The state the reducer reduces to
   * @template `Payload` - The type of values `source$` emits
   * @returns A registered reducer that can be passed into `combineReducers`, or
   *          called directly as if it was the `reducer` parameter itself.
   */
  <State, Payload>(
    source$: Observable<Payload>,
    reducer: Reducer<State, Payload>
  ): RegisteredReducer<State, Payload>;
};

export const reducer: ReducerCreator = <State>(
  actionCreator:
    | UnknownActionCreator
    | UnknownActionCreator[]
    | Observable<any>,
  reducerFn: Reducer<State, any>
) => {
  const wrapper = (state: State, payload: any) => reducerFn(state, payload);
  if (actionCreator instanceof Observable) {
    wrapper.trigger = {
      source$: actionCreator,
    };
  } else {
    wrapper.trigger = {
      actions: wrapInArray(actionCreator),
    };
  }
  return wrapper;
};

const ACTION_ORIGIN = Symbol('Action origin');

/**
 * Combine registered reducers into a stream operator
 *
 * Each reducer will receive the previous state (or the seed if it's the first
 * invocation) together with the payloads of the actions of the given reducer,
 * or the emitted values from the stream of the given reducer.
 *
 * The behaviour is undefined if multiple reducers are registered for the same
 * actions.
 *
 * This operator does not change whether the stream is hot or cold.
 *
 * The order of invocation for the reducers is controlled by the rxjs operator
 * `merge`, which is called with all the actions first and then the source
 * streams in the order their reducers are defined in the `reducers` argument.
 *
 * If a reducer throws an error, it will be nexted on the error subject. If the
 * error subject is not explicitly set, it will default to
 * `defaultErrorSubject`, which will rethrow the errors globally, as uncaught
 * exceptions. The stream will not complete or emit any value upon an error.
 *
 *
 * @param seed The initial input to the first reducer call
 * @param reducers The reducer entries that should be combined
 * @see rxjs.merge
 */
export const combineReducers = <State>(
  seed: State,
  reducers: RegisteredReducer<State, any>[],
  errorSubject: Subject<any> = defaultErrorSubject
): OperatorFunction<UnknownAction, State> => {
  const actionReducers = reducers.filter(isActionReducer);
  const streamReducers = reducers.filter(isStreamReducer);
  const reducersByActionType = new Map(
    actionReducers.flatMap((reducerFn) =>
      reducerFn.trigger.actions.map((action) => [action.type, reducerFn])
    )
  );

  type Packet =
    | { origin: typeof ACTION_ORIGIN; value: UnknownAction }
    | { origin: number; value: any };

  const source$s = streamReducers.map((reducerFn, i) =>
    reducerFn.trigger.source$.pipe(
      map((payload): Packet => ({ origin: i, value: payload }))
    )
  );

  return pipe(
    ofType(...actionReducers.flatMap((reducerFn) => reducerFn.trigger.actions)),
    map((action): Packet => ({ origin: ACTION_ORIGIN, value: action })),
    merge(...source$s),
    scan(
      ({ state }, packet) => {
        try {
          if (packet.origin === ACTION_ORIGIN) {
            const reducerFn = reducersByActionType.get(packet.value.type)!;
            return {
              caughtError: false,
              state: reducerFn(state, packet.value.payload),
            };
          }

          const reducerFn = streamReducers[packet.origin];
          return {
            caughtError: false,
            state: reducerFn(state, packet.value),
          };
        } catch (e) {
          errorSubject.next(e);
          return {
            caughtError: true,
            state,
          };
        }
      },
      { state: seed, caughtError: false }
    ),
    filter(({ caughtError }) => caughtError === false),
    map(({ state }) => state)
  );
};
