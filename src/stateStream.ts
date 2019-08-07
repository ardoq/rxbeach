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
 * @param reducers A Map from action types to reducers
 * @param seed The initial input to the first reducer call
 */
export const reduceActions = <State>(
  reducers: ReducerMap<State>,
  seed: State
): OperatorFunction<Action<any>, State> =>
  // TODO - write test
  pipe(
    ofType(...reducers.keys()),
    scan((state: State, { type, payload }: UnknownAction) => {
      const reducer = reducers.get(type);
      if (reducer) {
        return reducer(state, payload);
      } else {
        return state;
      }
    }, seed)
  );

/**
 * A stream operator that accepts actions, and returns a hot, reference counted,
 * state stream
 *
 * @param debugName
 * @param reducers
 * @param seed
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

export interface StateStreamFactory<StateShape> {
  seed: StateShape;

  (action$: ActionStream, dispatchAction: ActionDispatcher): {
    state$: Observable<StateShape>;
    action$: ActionStream;
    dispatchAction: ActionDispatcher;
  };
}

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
