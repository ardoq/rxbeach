import { ActionStream, ActionCreator, ActionDispatcher, Action } from "types";
import { merge } from "rxjs";
import { Epic } from "./epics";
import { createActionCreator } from "actionCreator";
import { subscribeAndGuard, ofType } from "utils";
import { tap } from "rxjs/operators";

type Saga<Action> = Epic<Action>;

type SagaDefinition<Payload> = ActionCreator<Payload> & {
  saga: Saga<Action<Payload>>;
};

type AnySagaDefinition = ActionCreator<any> & {
  saga: Saga<any>;
};

/**
 * Define a data routine
 *
 * A data routine provides data to other actions, or performs side effects where
 * the result of the side effect is needed in other actions. Examples are:
 *  - Providing context from `context$` to another action
 *  - Updating a model on the backend, and feeding the updated model to another
 *    function
 *
 * Data routines are the only routines that should have other streams hooked
 * onto them, but do not hook the action$ onto a saga. If you want to do that,
 * use an epic instead.
 *
 * @param saga The routine itself, a simple operator tha accepts actions and
 *             emits actions
 */
export const saga = <Payload = void>(
  saga: Saga<Action<Payload>>
): SagaDefinition<Payload> => ({
  ...createActionCreator<Payload>(""),
  saga
});

export type SagaSet = Set<AnySagaDefinition>;

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
