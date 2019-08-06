import { ActionStream, ActionCreator, ActionDispatcher } from "types";
import { merge } from "rxjs";
import { Epic } from "./epics";
import { createActionCreator } from "actionCreator";
import { subscribeAndGuard, ofType } from "utils";
import { tap } from "rxjs/operators";

type Saga<Payload> = Epic<Payload>;

type SagaDefinition<Payload> = ActionCreator<Payload> & {
  saga: Saga<Payload>;
};

export const saga = <Payload = void>(
  saga: Saga<Payload>
): SagaDefinition<Payload> => ({
  ...createActionCreator<Payload>(""),
  saga
});

export type SagaSet = Set<SagaDefinition<any>>;

export const attachSagas = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher,
  sagaDefinitions: SagaSet
) =>
  subscribeAndGuard(
    merge(
      [...sagaDefinitions].map(definition =>
        action$.pipe(
          ofType(definition.type),
          definition.saga,
          tap(action => dispatchAction(action))
        )
      )
    )
  );
