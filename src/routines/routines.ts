import { OperatorFunction, merge } from "rxjs";
import { createActionCreator } from "actionCreator";
import { ActionStream, Action, ActionCreator, VoidPayload } from "types";
import { subscribeAndGuard, ofType } from "utils";

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
export const routine = <Payload = VoidPayload>(
  debugName: string,
  routine: Routine<Action<Payload>>
): RoutineDefinition<Payload> => {
  const def: Partial<AnyRoutineDefinition> = createActionCreator(debugName);
  def.routine = routine;

  return def as RoutineDefinition<Payload>;
};

/**
 * Collect routines into a set for subscription with `subscribeRoutines`
 *
 * @param routines The routines to collect
 *
 * @see subscribeRoutines
 */
export const routineSet = (...routines: AnyRoutineDefinition[]): RoutineSet =>
  new Set(routines);

/**
 * Subscribe routines to an action stream
 *
 * @param action$ The action stream to subscribe the routines to
 * @param routineDefinitions The routines to subscribe, as returned by
 *                           `routineSet`
 */
export const subscribeRoutines = (
  action$: ActionStream,
  routineDefinitions: RoutineSet
) =>
  subscribeAndGuard(
    merge(
      ...[...routineDefinitions].map(action =>
        action$.pipe(
          ofType(action.type),
          action.routine
        )
      )
    )
  );
