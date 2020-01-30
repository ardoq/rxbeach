import { OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActionStream } from 'rxbeach';
import {
  RoutineFunc,
  defaultErrorSubject,
  UnknownAction,
} from 'rxbeach/internal';
import { mergeOperators } from 'rxbeach/operators';

export type Routine<T> = OperatorFunction<UnknownAction, T>;

/**
 * See collectRoutines for documentation
 */
export const routine: RoutineFunc = (
  ...args: OperatorFunction<any, any>[]
): Routine<any> => pipe(...(args as [OperatorFunction<any, any>]));

/**
 * Collect multiple routines to one
 *
 * A routine is simply a stream operator that will recieve actions, and is
 * supposed to perform side effects. This function uses the composite pattern,
 * so multiple routines can be collected into one routine.
 *
 * Routines are subscribed by passing them to a `subscribeRoutine` call.
 *
 * @see subscribeRoutine
 * @param routines The routines to collect
 * @returns A routine that calls the provided routines
 */
export const collectRoutines = (
  ...routines: Routine<unknown>[]
): Routine<unknown> => mergeOperators(...routines);

/**
 * Subscribe a routine to an action stream
 *
 * Errors will not cause the routine to be unsubscribed from the action stream.
 * We assume all errors stem from faulty action objects, so we allow ourselves
 * to continue the routine on errors. It is therefore important that the action
 * stream is "hot", so the same action object is not re-emitted right away to
 * the routine.
 *
 * If a routine throws an error, it will be nexted on the error subject. If the
 * error subject is not explicitly set, it will default to
 * `defaultErrorSubject`, which will rethrow the errors globally, as uncaught
 * exceptions.
 *
 * **NB**: Routines should not accidentally dispatch actions to the action$
 * when they are subscribed. If a routine dispatches an action when it is
 * subscribed, only some of the routines will receive the action.
 *
 * @param action$ The action stream to subscribe the routine to
 * @param routineToSubscribe The routine to subscribe
 * @param errorSubject An optional Subject that will receive errors form the
 *                     routine
 * @returns A Subscription object
 * @see defaultErrorSubject
 */
export const subscribeRoutine = (
  action$: ActionStream,
  routineToSubscribe: Routine<unknown>,
  errorSubject: Subject<any> = defaultErrorSubject
) =>
  action$
    .pipe(
      routineToSubscribe,
      catchError((err, stream) => {
        errorSubject.next(err);
        return stream;
      })
    )
    .subscribe();
