import { Subject, Subscription, catchError } from 'rxjs';
import { action$ as defaultAction$ } from './action$';
import { Routine, SubscribeRoutineFunc } from './internal/routineFunc';
import { ActionStream } from './types/helpers';
import { defaultErrorSubject } from './internal/defaultErrorSubject';

export class RoutinesRegistry {
  routines: Map<Routine<any>, Subscription | null> = new Map();

  private started = false;
  private action$ = defaultAction$;

  /**
   * Register a routine
   *
   * If the registry has already been started, the registered routine will also be
   * started.
   *
   *
   * @param routine The routine to register
   */
  register(routine: Routine<any>) {
    let subscription: Subscription | null = null;
    if (this.started) {
      subscription = this.subscribeRoutine(routine);
    }
    this.routines.set(routine, subscription);
  }

  /**
   * Start the registered routines.
   *
   * This causes the routines to actually start do side-effects over the action stream.
   *
   * Routines registered after this will also be started.
   *
   * If this is called twice an error will be thrown.
   *
   * @param action$ The action stream the streams should reduce over
   */
  startRoutines(action$?: ActionStream) {
    if (this.started) {
      throw new Error('Registry has already been started!');
    }
    this.action$ = action$ ?? this.action$;
    for (const [routine] of this.routines) {
      this.routines.set(routine, this.subscribeRoutine(routine, { action$ }));
    }
    this.started = true;
  }

  /**
   * Stops all the registered routines.
   *
   * This will call `unsubscribe` on all the routines.
   */
  stopRoutines() {
    this.started = false;
    for (const [routine] of this.routines) {
      this.routines.get(routine)?.unsubscribe();
    }
  }

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
   * @param routineToSubscribe The routine to subscribe
   * @param config Containes the errorSubject and action stream.
   *  both errorSubject and action$ have a default value.
   * @returns A Subscription object
   * @see defaultErrorSubject
   */
  subscribeRoutine: SubscribeRoutineFunc = (
    routineToSubscribe: Routine<unknown>,
    { errorSubject: e, action$: a$ } = {}
  ) => {
    const errorSubject: Subject<any> = e ?? defaultErrorSubject;
    const action$: ActionStream = a$ ?? this.action$;

    return action$
      .pipe(
        routineToSubscribe,
        catchError((err, stream) => {
          errorSubject.next(err);
          return stream;
        })
      )
      .subscribe();
  };
}

export const routinesRegistry = new RoutinesRegistry();
