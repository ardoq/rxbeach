import { Subject } from 'rxjs';
import { UnknownAction, markName } from './internal';
import { ActionStream, ActionDispatcher } from './types/helpers';
import { tag } from 'rxjs-spy/operators';
import { share } from 'rxjs/operators';
import { _namespaceAction } from './namespace';

const actionSubject$ = new Subject<UnknownAction>();

/**
 * The main action stream for RxBeach
 */
export const action$: ActionStream = actionSubject$.pipe(
  tag('action$'),
  markName('action$'),
  share()
);

/**
 * Dispatch an action to the action stream
 *
 * If namespace is provided, it will be set on the action.
 *
 * @param action The action to dispatch to action$
 * @param namespace Optional namespace to add to the action
 */
export const dispatchAction: ActionDispatcher = (action, namespace) => {
  if (namespace === undefined) {
    actionSubject$.next(action);
  } else {
    actionSubject$.next(_namespaceAction(namespace, action));
  }
};
