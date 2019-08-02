import { OperatorFunction, merge } from "rxjs";
import { ActionStream, ActionDispatcher, Action, ActionCreator } from "types";
import { subscribeAndGuard } from "utils";
import { createActionCreator } from "actionCreator";

/*
 * Module with utils for creating and using routines
 */

export type Routine<Payload> = (
  dispatchAction: ActionDispatcher
) => OperatorFunction<Action<Payload>, unknown>;

type RoutineDefinition<Payload> = ActionCreator<Payload> & {
  routine: Routine<Payload>;
};

export const routine = <Payload = void>(
  routine: Routine<Payload>
): RoutineDefinition<Payload> => ({
  ...createActionCreator<Payload>(""),
  routine
});

export type RoutineSet = Set<Routine<any>>;

export const subscribeRoutines = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  routines: RoutineSet
) =>
  subscribeAndGuard(
    merge([...routines].map(routine => action$.pipe(routine(dispatchAction))))
  );
