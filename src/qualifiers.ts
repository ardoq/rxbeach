import { ActionCreator, ActionDispatcher } from 'rxbeach';
import { UnknownAction } from 'rxbeach/internal';

/**
 * Create a new qualifier
 *
 * @param description A description of this qualifier, does not need to be
 *                    unique per instance. Usually the name of what will create
 *                    instances of qualifiers
 */
export const createQualifier = (description: string) => Symbol(description);

const _appendQualifierToAction = (
  qualifier: symbol,
  action: UnknownAction
) => ({
  type: action.type,
  payload: action.payload,
  meta: {
    ...action.meta,
    qualifier,
  },
});

/**
 * Decorate an action creator so the created actions have the given qualifier
 *
 * The given qualifier will replace existing qualifiers on the action objects.
 *
 * In contrast to `createChildDispatcher`, the function returned by this
 * function creates an action object instead of dispatching it.
 *
 * @see createChildDispatcher
 * @param qualifier The qualifier to set for the created actions
 * @param actionCreator The action creator to decorate
 * @returns An action creator that creates actions using the passed action
 *          creator, and sets the given qualifier
 */
export const createQualifiedActionCreator = <Payload>(
  qualifier: symbol,
  actionCreator: ActionCreator<Payload>
): ActionCreator<Payload> => {
  const creator = (payload?: any) =>
    _appendQualifierToAction(qualifier, actionCreator(payload));
  creator.type = actionCreator.type;

  return creator as ActionCreator<Payload>;
};

/**
 * Create a dispatcher that dispatches qualified actions to the parent dispatcher
 *
 * The given qualifier is set as the qualifier for each action dispatched with
 * this function, before the action is dispatched with the action dispatcher
 * from the arguments.
 *
 * In contrast to `createQualifiedActionCreator`, the function returned by this
 * function dispatches the action, instead of creating it.
 *
 * @see createQualifiedActionCreator
 * @param parentDispatcher The dispatcher the returned action dispatcher will
 *                         dispatch to
 * @param qualifier The qualifier that will be set for each action before they
 *                  are passed on to the parent dispatcher
 * @returns An action dispatcher that sets the qualifier before passing the
 *          actions to the parent dispatcher
 */
export const createChildDispatcher = (
  parentDispatcher: ActionDispatcher,
  qualifier: symbol
): ActionDispatcher => action =>
  parentDispatcher(_appendQualifierToAction(qualifier, action));
