import { Subject, Observable, OperatorFunction, pipe } from "rxjs";
import { scan, filter } from "rxjs/operators";
import { Action } from "types";
import { ReducerMap } from "reducer";

/**
 * Module with utils for creating and using state streams.
 *
 * A state stream is a stream which scans over an action stream to produce a
 * state.
 */

// Fix for unknown actions that may or may not have a payload. Fixes this error:
// Property 'payload' does not exist on type
//   '{ type: symbol; } | { type: symbol; payload: any; }'
type UnknownAction = { type: symbol; payload?: any };

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
