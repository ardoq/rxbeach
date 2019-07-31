import { OperatorFunction, pipe } from "rxjs";
import { scan, filter } from "rxjs/operators";
import { Action, UnknownAction } from "types";
import { ReducerMap } from "reducer";

/**
 * Module with utils for creating and using state streams.
 *
 * A state stream is a stream which scans over an action stream to produce a
 * state.
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
