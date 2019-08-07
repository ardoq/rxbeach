import { OperatorFunction, pipe, Observable } from "rxjs";
import { scan, filter, startWith, shareReplay } from "rxjs/operators";
import {
  getQualifier,
  createChildDispatcher,
  createChildActionStream
} from "qualifiers";
import { ReducerMap } from "reducer";
import { Action, UnknownAction, ActionStream, ActionDispatcher } from "types";
import { ofType } from "utils";

/**
 * Create a stream operator that reduces actions to a state
 *
 * The payload of each incoming action is applied to the matching reducers
 * together with the previous state (or the seed if it's the first invocation),
 * and the returned state is emitted.
 *
 * This operator does not change whether the stream is hot or cold.
 *
 * @param reducers A map from action types to reducers
 * @param seed The initial input to the first reducer call
 */
export const reduceActions = <State>(
  reducers: ReducerMap<State>,
  seed: State
): OperatorFunction<Action<any>, State> =>
  pipe(
    ofType(...reducers.keys()),
    scan((state: State, { type, payload }: UnknownAction) => {
      const reducer = reducers.get(type);
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

/**
 * A stream operator that accepts actions, and returns a hot, reference counted,
 * state stream
 *
 * The payload of each incoming action is applied to the matching reducers
 * together with the previous state (or the seed if it's the first invocation),
 * and the returned state is emitted. The stream is started with the seed, and
 * will replay the latest state to all subscribers.
 *
 * @param debugName A name for debugging purposes
 * @param reducers A map from action types to reducers
 * @param seed The initial state to emit and feed to the reducers
 */
export const reduceToStateStream = <StateShape>(
  debugName: string,
  reducers: ReducerMap<StateShape>,
  seed: StateShape
): OperatorFunction<Action<any>, StateShape> =>
  pipe(
    reduceActions(reducers, seed),
    startWith(seed),
    shareReplay({
      // All subscriptions to a state stream should receive the last state
      bufferSize: 1,
      // When all subscriptions are finished (for instance  when a `connect`ed
      // component is unmounted), The state should not be kept in memory
      refCount: true
    })
  );

/**
 * Create a qualified state stream
 *
 * This is intended for use with view model streams.
 *
 * This function takes everything that is needed to build a state stream, and
 * the action stream and action dispatcher from the parent stream and returns an
 * action stream, filtered on the qualifier, an action dispatcher, which adds
 * the qualifier, and the state stream.
 *
 * This, in essence, allows you to have multiple instances of the same state
 * stream connected to the same action stream.
 *
 * @param debugName A name for debugging purposes
 * @param reducers A map from action types to reducers
 * @param seed The initial state to emit and feed to the reducers
 * @param action$ The action$ to pipe the state stream from
 * @param dispatchAction The action dispatcher to dispatch qualified actions to
 * @returns `action$` - A derived stream from the `action$` argument that is
 *                      filtered on the qualifier, and has the qualifier
 *                      stripped away
 * @return `dispatchAction` - An action dispatcher that dispatches to the
 *                            `dispatchAction` argument, with an added qualifier
 * @return `state$` - A state stream that is piped from the returned `action$`,
 *                    and thus only reacts to actions dispatched with the
 *                    returned `dispatchAction` function
 */
const createQualifiedStateStream = <StateShape>(
  debugName: string,
  reducers: ReducerMap<StateShape>,
  seed: StateShape,
  action$: ActionStream,
  dispatchAction: ActionDispatcher
) => {
  const qualifier = getQualifier();

  const dispatchQualifiedAction = createChildDispatcher(
    dispatchAction,
    qualifier
  );
  const filteredAction$ = createChildActionStream(action$, qualifier);

  const state$ = filteredAction$.pipe(
    reduceToStateStream(debugName, reducers, seed)
  );

  return {
    state$,
    action$: filteredAction$,
    dispatchAction: dispatchQualifiedAction
  };
};

/**
 * Create an instance of this stream.
 *
 * @see createQualifiedStateStream
 */
export interface StateStreamFactory<StateShape> {
  seed: StateShape;

  (action$: ActionStream, dispatchAction: ActionDispatcher): {
    state$: Observable<StateShape>;
    action$: ActionStream;
    dispatchAction: ActionDispatcher;
  };
}

/**
 * Create a state stream factory
 *
 * This is mainly a utility function that curries `createQualifiedStateStream`,
 * but it also adds the `seed` argument to the returned factory.
 *
 * @param debugName A name for debugging purposes
 * @param reducers A map from action types to reducers
 * @param seed The initial state to emit and feed to the reducers
 *
 * @see createQualifiedStateStream
 */
export const createStateStreamFactory = <StateShape>(
  debugName: string,
  reducers: ReducerMap<StateShape>,
  seed: StateShape
): StateStreamFactory<StateShape> => {
  const factory = (action$: ActionStream, dispatchAction: ActionDispatcher) =>
    createQualifiedStateStream(
      debugName,
      reducers,
      seed,
      action$,
      dispatchAction
    );
  factory.seed = seed;
  return factory;
};
