import {
  ActionWithPayload,
  ActionWithoutPayload,
  ActionStream,
  AnyAction
} from "types";
import { Subject } from "rxjs";
import { tap } from "rxjs/operators";

export const actionWithoutPayload = (
  type: symbol,
  qualifiers: symbol[] = []
): ActionWithoutPayload => ({
  meta: { qualifiers },
  type
});

export const actionWithPayload = <P>(
  type: symbol,
  payload: P,
  qualifiers: symbol[] = []
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifiers),
  payload
});

/**
 * NB: Rememeber to attach routines after calling this, so the actions arrive in
 * the order you expect
 */
export const checkActions = async (
  action$: Subject<AnyAction>,
  checkers: ((action: AnyAction) => void)[]
) => {
  let i = 0;
  await action$
    .pipe(
      tap(action => {
        const checker = checkers[i];

        checker(action);

        if (++i === checkers.length) {
          action$.complete();
        }
      })
    )
    .toPromise();
};
