import { ActionCreator, ActionDispatcher } from 'rxbeach';
import { UnknownAction } from 'rxbeach/internal';

/**
 * Create a new namespace
 *
 * @param description A description of this namespace, does not need to be
 *                    unique per instance. Usually the name of what will create
 *                    instances of namespaces
 */
export const createNamespace = (description: string) => Symbol(description);

const _namespaceAction = (namespace: symbol, action: UnknownAction) => ({
  type: action.type,
  payload: action.payload,
  meta: {
    ...action.meta,
    namespace,
  },
});

/**
 * Decorate an action creator so the created actions have the given namespace
 *
 * The given namespace will replace existing namespaces on the action objects.
 *
 * In contrast to `namespaceActionDispatcher`, the function returned by this
 * function creates an action object instead of dispatching it.
 *
 * @see namespaceActionDispatcher
 * @param namespace The namespace to set for the created actions
 * @param actionCreator The action creator to decorate
 * @returns An action creator that creates actions using the passed action
 *          creator, and sets the given namespace
 */
export const namespaceActionCreator = <Payload>(
  namespace: symbol,
  actionCreator: ActionCreator<Payload>
): ActionCreator<Payload> => {
  const creator = (payload?: any) =>
    _namespaceAction(namespace, actionCreator(payload));
  creator.type = actionCreator.type;

  return creator as ActionCreator<Payload>;
};

/**
 * Decorate an action dispatcher so it dispatches namespaced actions
 *
 * The given namespace is set as the namespace for each action dispatched with
 * this function, before the action is dispatched with the action dispatcher
 * from the arguments.
 *
 * In contrast to `namespaceActionCreator`, the function returned by this
 * function dispatches the action, instead of creating it.
 *
 * @see namespaceActionCreator
 * @param parentDispatcher The dispatcher the returned action dispatcher will
 *                         dispatch to
 * @param namespace The namespace that will be set for each action before they
 *                  are passed on to the parent dispatcher
 * @returns An action dispatcher that sets the namespace before passing the
 *          actions to the parent dispatcher
 */
export const namespaceActionDispatcher = (
  namespace: symbol,
  parentDispatcher: ActionDispatcher
): ActionDispatcher => action =>
  parentDispatcher(_namespaceAction(namespace, action));
