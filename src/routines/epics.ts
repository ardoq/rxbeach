import { OperatorFunction, merge } from "rxjs";
import { tap } from "rxjs/operators";
import {
  Action,
  ActionStream,
  ActionDispatcher,
  AnyAction,
  ActionCreator,
  VoidPayload
} from "types";
import { subscribeAndGuard, ofType } from "utils";

export type Epic<Action> = OperatorFunction<Action, AnyAction>;

type EpicDefinition<Action> = {
  actions: symbol[];
  epic: Epic<Action>;
};

type EpicSet = Set<EpicDefinition<any>>;

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
 * @template `Payload` - The type of payload on the action creators
 */
export const epic = <Payload = VoidPayload>(
  epic: Epic<Action<Payload>>,
  ...actions: ActionCreator<Payload>[]
): EpicDefinition<Action<Payload>> => ({
  actions: actions.map(({ type }) => type),
  epic
});

/**
 * Collect epics into a set for attaching with `attachEpics`
 *
 * @param epics The epics to include in the set
 *
 * @see attachEpics
 */
export const epicSet = (...epics: EpicDefinition<any>[]): EpicSet =>
  new Set(epics);

/**
 * Attach epics to an action stream
 *
 * @param action$ The action stream to attach the epics to
 * @param dispatchAction The function to dispatch actions returned by the epics
 * @param epicDefinitions The epics to attach to the action stream
 */
export const attachEpics = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  epicDefinitions: EpicSet
) =>
  subscribeAndGuard(
    merge(
      ...[...epicDefinitions].map(epic =>
        action$.pipe(
          ofType(...epic.actions),
          epic.epic,
          tap(action => dispatchAction(action))
        )
      )
    )
  );
