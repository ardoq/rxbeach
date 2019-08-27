import { MonoTypeOperatorFunction } from "rxjs";
import { filter, map } from "rxjs/operators";
import { ActionDispatcher, ActionStream } from "types/helpers";
import { Action, UnknownAction } from "types/Action";
import { ActionCreator } from "types/ActionCreator";

/**
 * Alias to create a new symbol
 */
export const getQualifier = () => Symbol();

/**
 * Stream operator that filters out actions without the correct top qualifier
 *
 * @param qualifier The qualifier to filter for
 */
const filterQualifier = (
  qualifier: symbol
): MonoTypeOperatorFunction<Action<any>> =>
  filter(
    ({
      meta: {
        qualifiers: [actionQualifier]
      }
    }) => actionQualifier === qualifier
  );

/**
 * Stream operator that strips out the top qualifier of all actions
 *
 * Does no checks to ensure qualifiers exists before stripping them. Will error
 * out if no qualifers are set.
 */
const stripQualifier = (): MonoTypeOperatorFunction<Action<any>> =>
  map(({ meta: { qualifiers: [, ...qualifiers], ...meta }, ...action }) => ({
    ...action,
    meta: { ...meta, qualifiers }
  }));

export const _appendQualifierToAction = (
  qualifier: symbol,
  action: UnknownAction
) => ({
  type: action.type,
  payload: action.payload,
  meta: {
    ...action.meta,
    qualifiers: [qualifier, ...action.meta.qualifiers]
  }
});

/**
 * Decorate an action creator so that the created actions have qualifiers
 *
 * The given qualifier is added as the top qualifier to each action created by
 * the action creator.
 *
 * Existing qualifiers on the actions will be shifted down.
 *
 * In contrast to `createChildDispatcher`, the function returned by this
 * function creates an action object instead of dispatching it.
 *
 * @see createChildDispatcher
 * @param qualifier The qualifier to add to the created actions
 * @param actionCreator The action creator to decorate
 * @returns An action creator that creates actions using the passed action
 *          creator, and adds the qualifier
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
 * The given qualifier is added as the top qualifier to each action dispatched
 * with this function, before the action is dispatched with the action
 * dispatcher from the arguments.
 *
 * Existing qualifiers on the actions will be shifted down.
 *
 * In contrast to `createQualifiedActionCreator`, the function returned by this
 * function dispatches the action, instead of creating it.
 *
 * @see createQualifiedActionCreator
 * @param parentDispatcher The dispatcher the returned  action dispatcher will
 *                         dispatch to
 * @param qualifier The qualifier that is added as the top qualifier to each
 *                  action before they are passed on to the parent dispatcher
 * @returns An action dispatches that adds the qualifier before passing the
 *          actions to the parent dispatcher
 */
export const createChildDispatcher = (
  parentDispatcher: ActionDispatcher,
  qualifier: symbol
): ActionDispatcher => action =>
  parentDispatcher(_appendQualifierToAction(qualifier, action));

/**
 * Create an action stream that only emits actions with the correct top qualifier
 *
 * The returned stream will only return actions that had the given qualifier as
 * top qualifier on the given action stream. The emited actions on the returned
 * stream will have the qualifier removed.
 *
 * @param action$ The action stream with qualified actions
 * @param qualifier The qualifier to filter for
 * @returns An action stream filtered on the given qualifier, but with the
 *          qualifier stripped away
 */
export const createChildActionStream = (
  action$: ActionStream,
  qualifier: symbol
): ActionStream =>
  action$.pipe(
    filterQualifier(qualifier),
    stripQualifier()
  );
