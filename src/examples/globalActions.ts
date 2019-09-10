import { Subject } from "rxjs";
import { Action } from "lib/types/Action";
import { ActionDispatcher } from "lib/types/helpers";

export const action$ = new Subject<Action<any>>();
export const dispatchAction: ActionDispatcher = action => action$.next(action);
