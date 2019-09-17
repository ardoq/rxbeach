import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Reducer, ReducerDefinition } from "reducer";

/**
 * Silences errors and subscribes the stream
 *
 * Errors are logged to console, and the stream will continue.
 *
 * @param stream$ The stream to subscribe and silence errors from
 */
export const subscribeAndGuard = (stream$: Observable<unknown>) =>
  stream$
    .pipe(
      catchError((error, stream) => {
        console.error("UNHANDLED ERROR IN STREAM", error);
        return stream;
      })
    )
    .subscribe();

/**
 * Extract the reducer from a reducer definition, for using the same reducer
 * in multiple definitions
 *
 * ```
 * export const aliasReducerAction = reducer(sameReducerFn(originalReducerAction));
 * ```
 *
 * @param ReducerDefinition The reducer definition to extract the reducer from
 */
export const sameReducerFn = <State, Payload>(
  ReducerDefinition: ReducerDefinition<State, Payload>
): Reducer<State, Payload> => ReducerDefinition.reducer[1];
