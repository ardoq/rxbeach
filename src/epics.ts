import { OperatorFunction, merge, MonoTypeOperatorFunction } from "rxjs";

import {
  Action,
  UnknownAction,
  ActionStream,
  ActionDispatcher,
  AnyAction,
  ActionCreator
} from "types";

import { subscribeAndGuard, ofTypes } from "utils";

import { tap } from "rxjs/operators";

type Epic<Payload> = OperatorFunction<Action<Payload>, AnyAction>;

type EpicDefinition<Payload> = {
  actions: symbol[];
  epic: Epic<Payload>;
};

export const epic = <Payload = void>(
  epic: Epic<Payload>,
  ...actions: ActionCreator<Payload>[]
): EpicDefinition<Payload> => ({
  actions: actions.map(({ type }) => type),
  epic
});

export type EpicSet = Set<EpicDefinition<any>>;

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
          // TODO - why don't typings work here?
          (epic as unknown) as MonoTypeOperatorFunction<UnknownAction>,
          tap(action => dispatchAction(action))
        )
      )
    )
  );
