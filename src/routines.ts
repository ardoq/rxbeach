import { OperatorFunction, merge } from "rxjs";
import { ActionStream, AnyAction, ActionDispatcher } from "types";
import { subscribeAndGuard } from "utils";

/*
 * Module with utils for creating and using routines
 */

export type Routine = (
  dispatchAction: ActionDispatcher
) => OperatorFunction<AnyAction, unknown>;
export type RoutineSet = Set<Routine>;

export const subscribeRoutines = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  routines: Set<Routine>
) =>
  subscribeAndGuard(
    merge([...routines].map(routine => action$.pipe(routine(dispatchAction))))
  );
