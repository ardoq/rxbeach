import { ActionCreator } from './types/ActionCreator';
import { ActionDispatcher } from './types/helpers';
import { UnknownAction, VoidPayload } from './internal/types';

export const _namespaceAction = (namespace: string, action: UnknownAction) =>
  Object.freeze({
    type: action.type,
    payload: action.payload,
    meta: Object.freeze({
      ...action.meta,
      namespace,
    }),
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
export const namespaceActionCreator = <Payload = VoidPayload>(
  namespace: string,
  actionCreator: ActionCreator<Payload>
): ActionCreator<Payload> => {
  const creator = (payload?: any) =>
    _namespaceAction(namespace, actionCreator(payload));
  creator.type = actionCreator.type;

  return Object.freeze(creator) as ActionCreator<Payload>;
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
  namespace: string,
  parentDispatcher: ActionDispatcher
): ActionDispatcher => (action) =>
  parentDispatcher(_namespaceAction(namespace, action));
