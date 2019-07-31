import { Observable, OperatorFunction, merge } from "rxjs";
import { Action, ActionStream } from "types";

/**
 * Module with utils for creating and using routines
 */

type Routine = OperatorFunction<Action, unknown>;

const subscribeAndGuard = (stream$: Observable<unknown>) =>
  stream$.subscribe(
    () => null,
    (error: Error) => {
      console.error("UNHANDLED ERROR IN ACTION$ ROUTINE", error);

      // TODO is this needed? Inherited from ardoq subscribeAndGuard
      subscribeAndGuard(stream$);
    }
  );

export const subscribeRoutines = (
  action$: ActionStream,
  routines: Set<Routine>
) =>
  subscribeAndGuard(merge([...routines].map(routine => action$.pipe(routine))));
