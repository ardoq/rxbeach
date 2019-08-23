import { OperatorFunction, pipe, Observable } from "rxjs";
import { startWith, shareReplay } from "rxjs/operators";
import {
  getQualifier,
  createChildDispatcher,
  createChildActionStream
} from "qualifiers";
import { AnyAction } from "types/Action";
import { ActionStream, ActionDispatcher } from "types/helpers";

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
 * @param reducerOperator A streaming operator that reduces actions to a state
 * @param seed The initial state to emit and feed to the reducers
 */
export const reduceToStateStream = <StateShape>(
  debugName: string,
  reducerOperator: OperatorFunction<AnyAction, StateShape>,
  seed: StateShape
): OperatorFunction<AnyAction, StateShape> =>
  pipe(
    reducerOperator,
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
 * @param reducerOperator A streaming operator that reduces actions to a state
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
  reducerOperator: OperatorFunction<AnyAction, StateShape>,
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
    reduceToStateStream(debugName, reducerOperator, seed)
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
 * @param reducerOperator A streaming operator that reduces actions to a state
 * @param seed The initial state to emit and feed to the reducers
 *
 * @see createQualifiedStateStream
 */
export const createStateStreamFactory = <StateShape>(
  debugName: string,
  reducerOperator: OperatorFunction<AnyAction, StateShape>,
  seed: StateShape
): StateStreamFactory<StateShape> => {
  const factory = (action$: ActionStream, dispatchAction: ActionDispatcher) =>
    createQualifiedStateStream(
      debugName,
      reducerOperator,
      seed,
      action$,
      dispatchAction
    );
  factory.seed = seed;
  return factory;
};
