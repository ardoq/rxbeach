import { OperatorFunction, merge } from "rxjs";
import { ActionStream, ActionDispatcher, Action, ActionCreator } from "types";
import { subscribeAndGuard, ofType } from "utils";
import { createActionCreator } from "actionCreator";

/*
 * Module with utils for creating and using routines
 */

type Routine<Payload> = (
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

export type RoutineSet = Set<RoutineDefinition<any>>;

export const subscribeRoutines = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  routineDefinitions: RoutineSet
) =>
  subscribeAndGuard(
    merge(
      [...routineDefinitions].map(action =>
        action$.pipe(
          ofType(action.type),
          action.routine(dispatchAction)
        )
      )
    )
  );
