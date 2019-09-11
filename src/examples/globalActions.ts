import { Subject } from "rxjs";
import { Action } from "lib/types/Action";
import { ActionDispatcher } from "lib/types/helpers";
import { tag } from "rxjs-spy/operators";

const actionSubject$ = new Subject<Action<any>>();

export const action$ = actionSubject$.pipe(tag("action$"));

export const dispatchAction: ActionDispatcher = action =>
  actionSubject$.next(action);
