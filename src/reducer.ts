import {
  Observable,
  ObservableInput,
  OperatorFunction,
  Subject,
  from,
  pipe,
} from 'rxjs';
import { filter, map, mergeWith, scan } from 'rxjs/operators';
import type { UnknownAction, VoidPayload } from './internal/types';
import type { ActionCreator } from './types/ActionCreator';
import { defaultErrorSubject } from './internal/defaultErrorSubject';
import { ofType } from './operators/operators';
import { isObservableInput } from './isObservableInput';

const wrapInArray = <T>(val: T | T[]): T[] =>
  Array.isArray(val) ? val : [val];

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload,
  namespace?: string
) => State;

type RegisteredActionReducer<State, Payload = any> = Reducer<State, Payload> & {
  trigger: {
    actions: ActionCreator<Payload>[];
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
    | { actions: ActionCreator<Payload>[] }
    | { source$: Observable<Payload> };
};

const isActionReducer = <State, Payload>(
  reducerFn: RegisteredReducer<State, Payload>
): reducerFn is RegisteredActionReducer<State, Payload> =>
  'actions' in reducerFn.trigger;

const isStreamReducer = <State, Payload>(
  reducerFn: RegisteredReducer<State, Payload>
): reducerFn is RegisteredStreamReducer<State, Payload> =>
  'source$' in reducerFn.trigger;

/**
 * A stream reducer is a stream operator which updates the state of a given stream with the last
 * emitted state of another stream, meaning it reduces the state of a given stream over another
 * stream.
 *
 * Another way of looking at it is in terms of an action reducer this avoids creating a new action
 * and dispatching it manually on every emit from the source observable. This treats the observable
 * state as the action.
 *
 * ```ts
 * // Listen for changes on context$
 * streamReducer(
 *   context$,
 *   (state, context) => {
 *     // context changed!
 * })
 *
 * // Listen for specific changes on context$
 * streamReducer(
 *   context$.pipe(
 *     map(context => ({ id })),
 *     distinctUntilChanged()
 *   ),
 *   (state, contextId) => {
 *     // contextId changed!
 * })
 * ```
 *
 * @param source The observable that the reducer function should be subscribed to, which act as
 *                the "action" of the reducer.
 * @param reducerFn The reducer function with signature:
 *                  (prevState, observableInput) => nextState
 * @returns A wrapped reducer function for use with persistedReducedStream, combineReducers etc.
 */
export const streamReducer = <State, EmittedState>(
  source: ObservableInput<EmittedState>,
  reducerFn: Reducer<State, EmittedState>
): RegisteredReducer<State, EmittedState> => {
  const wrappedStreamReducer = (
    state: State,
    emittedState: EmittedState,
    namespace?: string
  ) => reducerFn(state, emittedState, namespace);

  wrappedStreamReducer.trigger = {
    source$: from(source),
  };

  return wrappedStreamReducer;
};

/**
 * actionReducer
 * A action reducer is a stream operator which triggers its reducer when a
 * relevant action is dispatched to the action$
 *
 * @param actionCreator The actionCreator that creates the action that should run the reducer
 * @param reducerFn The reducer function with signature: (prevState, action) => newState
 * @returns A wrapped reducer function for use with persistedReducedStream, combineReducers etc.
 */
export const actionReducer = <State, Payload>(
  actionCreator: ActionCreator<Payload>,
  reducerFn: Reducer<State, Payload>
): RegisteredReducer<State, Payload> => {
  const wrappedActionReducer = (
    state: State,
    payload: Payload,
    namespace?: string
  ) => reducerFn(state, payload, namespace);

  wrappedActionReducer.trigger = {
    actions: [actionCreator],
  };

  return wrappedActionReducer;
};

/**
 * @deprecated
 * v2.6.0, use actionReducer or streamReducer instead.
 * If using multi-action reducers you have to split them into individual reducers
 */
export const reducer = <State, Payload>(
  trigger:
    | ActionCreator<Payload>
    | ActionCreator<Payload>[]
    | ObservableInput<Payload>,
  reducerFn: Reducer<State, Payload>
): RegisteredReducer<State, Payload> => {
  if (!Array.isArray(trigger) && isObservableInput(trigger)) {
    return streamReducer(trigger, reducerFn);
  }

  const wrappedActionReducer = (
    state: State,
    payload: Payload,
    namespace?: string
  ) => reducerFn(state, payload, namespace);

  wrappedActionReducer.trigger = {
    actions: wrapInArray(trigger),
  };

  return wrappedActionReducer;
};

const ACTION_ORIGIN = Symbol('Action origin');

type CombineReducersConfig = {
  errorSubject?: Subject<any>;
  namespace?: string;
};

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
 * @param seed The initial input to the first reducer call
 * @param reducers The reducer entries that should be combined
 * @param namespace Namespace to pass on to the reducers. Note that this will
 *                  always be passed, regardless of namespaces of the actions.
 * @see rxjs.merge
 */
export const combineReducers = <State>(
  seed: State,
  reducers: RegisteredReducer<State, any>[],
  { errorSubject = defaultErrorSubject, namespace }: CombineReducersConfig = {}
): OperatorFunction<UnknownAction, State> => {
  const actionReducers = reducers.filter(isActionReducer);
  const streamReducers = reducers.filter(isStreamReducer);
  const reducersByActionType = new Map(
    actionReducers.flatMap((reducerFn) =>
      reducerFn.trigger.actions.map((actionCreator) => [
        actionCreator.type,
        reducerFn,
      ])
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
    mergeWith(...source$s),
    scan(
      ({ state }, packet) => {
        try {
          if (packet.origin === ACTION_ORIGIN) {
            const reducerFn = reducersByActionType.get(packet.value.type)!;
            return {
              caughtError: false,
              state: reducerFn(state, packet.value.payload, namespace),
            };
          }

          const reducerFn = streamReducers[packet.origin];
          return {
            caughtError: false,
            state: reducerFn(state, packet.value, namespace),
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
