import { OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActionStream } from 'rxbeach';
import { AnyAction, RoutineFunc } from 'rxbeach/internal';
import { mergeOperators } from 'rxbeach/operators';

export type Routine<T> = OperatorFunction<AnyAction, T>;

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
 * The subscription will silence errors, meaning the errors will be emitted on
 * the optional error subject, but the routine will not be unsubscribed. This
 * makes sure the whole routine doesn't crash from a single faulty action. Make
 * sure that the action stream is a hot stream, so the routine will not recieve
 * the same error indefinetly.
 *
 * @param action$ The action stream to subscribe the routine to
 * @param routine The routine to subscribe
 * @param errorSubject An optional Subject that will recieve errors form the
 *                     routine
 * @returns A Subscription object
 */
export const subscribeRoutine = (
  action$: ActionStream,
  routine: Routine<unknown>,
  errorSubject?: Subject<any>
) =>
  action$
    .pipe(
      routine,
      catchError((err, stream) => {
        if (errorSubject) errorSubject.next(err);
        return stream;
      })
    )
    .subscribe();
