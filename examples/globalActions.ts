import { Subject } from 'rxjs';
import { ActionDispatcher, ActionStream } from 'rxbeach';
import { tag } from 'rxjs-spy/operators';
import { UnknownAction } from 'rxbeach/internal';

const actionSubject$ = new Subject<UnknownAction>();

export const action$: ActionStream = actionSubject$.pipe(tag('action$'));

export const dispatchAction: ActionDispatcher = action =>
  actionSubject$.next(action);
