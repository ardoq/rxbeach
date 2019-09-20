import { Subject } from 'rxjs';
import { Action, ActionDispatcher, ActionStream } from 'rxbeach';
import { tag } from 'rxjs-spy/operators';

const actionSubject$ = new Subject<Action<any>>();

export const action$: ActionStream = actionSubject$.pipe(tag('action$'));

export const dispatchAction: ActionDispatcher = action =>
  actionSubject$.next(action);
