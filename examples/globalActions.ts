import { Subject } from "rxjs";
import { Action, ActionDispatcher } from "types";

export const action$ = new Subject<Action<any>>();
export const dispatchAction: ActionDispatcher = action => action$.next(action);
