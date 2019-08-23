import { Subject } from "rxjs";
import { Action } from "types/Action";
import { ActionDispatcher } from "types/helpers";

export const action$ = new Subject<Action<any>>();
export const dispatchAction: ActionDispatcher = action => action$.next(action);
