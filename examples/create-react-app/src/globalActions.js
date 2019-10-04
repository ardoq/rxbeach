import { Subject } from 'rxjs';
import { tag } from 'rxjs-spy/operators';

const actionSubject$ = new Subject();

export const action$ = actionSubject$.pipe(tag('action$'));

export const dispatchAction = action => actionSubject$.next(action);
