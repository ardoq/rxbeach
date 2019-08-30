import {
  ActionWithPayload,
  ActionWithoutPayload,
  AnyAction
} from "types/Action";
import { Subject, Observable, OperatorFunction } from "rxjs";
import { tap, reduce } from "rxjs/operators";

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

type AnyProducer = () => any;
export const getContext = <ContextCreator extends AnyProducer>(
  mochaContext: Mocha.Context,
  contextCreator: ContextCreator
): ReturnType<ContextCreator> => {
  if (mochaContext.context === undefined) {
    mochaContext.context = contextCreator();
  }
  return mochaContext.context;
};

const collectHistory = <T>(): OperatorFunction<T, T[]> =>
  reduce((acc, value) => [...acc, value], [] as T[]);

/**
 * Returnes a promise that resolves to an array of the history of the observable
 * when the observable is completed.
 */
export const toHistoryPromise = <T>(obs: Observable<T>): Promise<T[]> =>
  obs.pipe(collectHistory()).toPromise();
