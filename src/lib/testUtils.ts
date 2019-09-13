import {
  Subject,
  Observable,
  OperatorFunction,
  of,
  BehaviorSubject,
  timer
} from "rxjs";
import { tap, reduce, take, delay, zip } from "rxjs/operators";
import {
  ActionWithPayload,
  ActionWithoutPayload,
  AnyAction
} from "lib/types/Action";
import { subscriptionCount } from "rxjs-subscription-count";

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

export const beforeEach = <T>(
  suite: Mocha.Suite,
  setup: () => T
): ((context: Mocha.Context) => T) => {
  suite.beforeEach(function() {
    this.scaffolding = setup();
  });

  return context => context.scaffolding as T;
};

const collectHistory = <T>(): OperatorFunction<T, T[]> =>
  reduce((acc, value) => [...acc, value], [] as T[]);

/**
 * Returnes a promise that resolves to an array of the history of the observable
 * when the observable is completed.
 */
export const toHistoryPromise = <T>(obs: Observable<T>): Promise<T[]> =>
  obs.pipe(collectHistory()).toPromise();

export const latest = <T>(obs: Observable<T>): Promise<T> =>
  obs.pipe(take(1)).toPromise();

export const testStream = <T>(
  ...values: T[]
): [Observable<T>, BehaviorSubject<number>] => {
  const subscriptionCounter = new BehaviorSubject(0);
  const stream = of(...values).pipe(
    // Makes sure each value is emitted with one node-tick in between
    zip(timer(0, 0), v => v),
    subscriptionCount(subscriptionCounter)
  );

  return [stream, subscriptionCounter];
};
