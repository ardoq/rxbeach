import { OperatorFunction, pipe, Observable } from "rxjs";
import { scan, filter, startWith, shareReplay } from "rxjs/operators";
import {
  getQualifier,
  createChildDispatcher,
  createChildActionStream
} from "qualifiers";
import { ReducerMap } from "reducer";
import { Action, UnknownAction, ActionStream, ActionDispatcher } from "types";

/*
 * Module with utils for creating and using state streams.
 *
 * A state stream is a stream which scans over an action stream to produce a
 * state.
 */

/**
 * A stream operator that accepts actions and returns a state stream
 *
 * @param reducers
 * @param seed
 */
export const reduceActions = <State>(
  reducers: ReducerMap<State>,
  seed: State
): OperatorFunction<Action<any>, State> =>
  pipe(
    filter(({ type }) => reducers.has(type)),
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
