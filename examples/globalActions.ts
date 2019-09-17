import { Subject } from "rxjs";
import { Action } from "stream-patterns/types/Action";
import { ActionDispatcher } from "stream-patterns/types/helpers";
import { tag } from "rxjs-spy/operators";

const actionSubject$ = new Subject<Action<any>>();

export const action$ = actionSubject$.pipe(tag("action$"));

export const dispatchAction: ActionDispatcher = action =>
  actionSubject$.next(action);
