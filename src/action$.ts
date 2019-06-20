import { AnyActionMaybePayload } from "lib/types";
import { Subject, Observable } from "rxjs";

export type Action$ = Observable<AnyActionMaybePayload>;
const action$ = new Subject<AnyActionMaybePayload>();

export const dispatchAction = (action: AnyActionMaybePayload) =>
  action$.next(action);

export default action$ as Action$; // Cast down so others can't .next it
