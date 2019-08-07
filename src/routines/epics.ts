import { OperatorFunction, merge } from "rxjs";
import { tap } from "rxjs/operators";
import {
  Action,
  ActionStream,
  ActionDispatcher,
  AnyAction,
  ActionCreator
} from "types";
import { subscribeAndGuard, ofTypes } from "utils";

export type Epic<Action> = OperatorFunction<Action, AnyAction>;

type EpicDefinition<Action> = {
  actions: symbol[];
  epic: Epic<Action>;
};

export type EpicSet = Set<EpicDefinition<any>>;

/**
 * Define a multiplexing routine
 *
 * A multiplexing routine accepts actions and emits actions. There does not
 * need to be correspondence between the amount of actions accepted and emitted.
 *
 * Use a multiplexing routine when you need to hook your own actions into
 * stand alone / notification actions.
 *
 * Multiplexing routines should not rely on other streams. Do **not hook other
 * streams onto a multiplexing routine**.
 *
 * @param epic The routine itself, a simple operator that accepts actions and
 *             emits actions
 * @param actions The actions to accept
 */
export const epic = <Payload = void>(
  epic: Epic<Action<Payload>>,
  ...actions: ActionCreator<Payload>[]
): EpicDefinition<Action<Payload>> => ({
  actions: actions.map(({ type }) => type),
  epic
});

export const attachEpics = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  epicDefinitions: EpicSet
) =>
  subscribeAndGuard(
    merge(
      [...epicDefinitions].map(epic =>
        action$.pipe(
          ofTypes(epic.actions),
          epic.epic,
          tap(action => dispatchAction(action))
        )
      )
    )
  );
