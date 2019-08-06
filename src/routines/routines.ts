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

/**
 * Define a pure routine
 *
 * A pure routine is a bit like a function, it is invoked to perform a single
 * side effect. You should **not hook other streams onto a pure routine**, use a
 * saga that invokes a routine if you need to do that.
 *
 * This function provides typings for the routine, and creates a corresponding
 * action creator.
 *
 * @param routine The routine itself, a simple operator function that accepts
 *                payloads
 */
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
