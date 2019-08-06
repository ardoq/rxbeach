import { OperatorFunction, merge } from "rxjs";
import { ActionStream, Action, ActionCreator } from "types";
import { subscribeAndGuard, ofType } from "utils";
import { createActionCreator } from "actionCreator";

/*
 * Module with utils for creating and using routines
 */

type Routine<Action> = OperatorFunction<Action, unknown>;

type RoutineDefinition<Payload> = ActionCreator<Payload> & {
  routine: Routine<Action<Payload>>;
};

type AnyRoutineDefinition = ActionCreator<any> & {
  routine: Routine<any>;
};

export type RoutineSet = Set<AnyRoutineDefinition>;

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
  debugName: string,
  routine: Routine<Action<Payload>>
): RoutineDefinition<Payload> => ({
  ...createActionCreator<Payload>(debugName),
  routine
});

export const subscribeRoutines = (
  action$: ActionStream,
  routineDefinitions: RoutineSet
) =>
  subscribeAndGuard(
    merge(
      [...routineDefinitions].map(action =>
        action$.pipe(
          ofType(action.type),
          action.routine
        )
      )
    )
  );
