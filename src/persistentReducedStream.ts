import {
  BehaviorSubject,
  Observable,
  Subscription,
  Subject,
  SubscriptionLike,
  Operator,
  Subscriber,
  TeardownLogic,
} from 'rxjs';
import { ActionStream } from './types/helpers';
import { RegisteredReducer, combineReducers } from './reducer';
import { defaultErrorSubject } from './internal/defaultErrorSubject';
import { markName } from './internal/markers';
import { tag } from 'rxjs-spy/operators';

/**
 * A hot, persistent observable with a state field
 */
export class StateStream<State> extends Observable<State>
  implements SubscriptionLike {
  private subject: BehaviorSubject<State>;
  private subscription: Subscription;

  constructor(initialState: State, reducedState$: Observable<State>) {
    super();
    this.subject = new BehaviorSubject(initialState);

    // NOTE: .subscribe(this.subject) does not work
    // All tests pass with it, but in practice there are cases
    // where the subject isn't updated as expected
    this.subscription = reducedState$.subscribe({
      complete: () => this.subject.complete(),
      error: (err) => this.subject.error(err),
      next: (state) => this.subject.next(state),
    });
  }

  get state(): State {
    return this.subject.getValue();
  }

  get closed() {
    return this.subject.closed;
  }

  lift<R>(operator: Operator<State, R>): Observable<R> {
    return this.subject.lift(operator);
  }

  unsubscribe() {
    this.subscription.unsubscribe();
    this.subject.unsubscribe();
  }

  _trySubscribe(subscriber: Subscriber<State>): TeardownLogic {
    return this.subject._trySubscribe(subscriber);
  }

  _subscribe(subscriber: Subscriber<State>): Subscription {
    return this.subject._subscribe(subscriber);
  }
}

/**
 * Create a reduced state stream
 *
 * A reduced state stream is a stream that scans over an action stream and other
 * stream to build up a state. It is eternally subscribed and always exposes
 * it latest value like a Behaviour subject.
 *
 * ```
 * const myState$ = persistentReducedStream(
 *   'myState$',
 *   initialState,
 *   reducers,
 *   action$
 * );
 *
 * myState$.value === initialState // Will be true
 * ```
 *
 * @param name The name of the stream, used for placing a marker and spy tag
 * @param initialState The initial state of the stream
 * @param reducers The reducers that build up the stream state
 * @param action$ The action stream the action reducers should reduce over
 */
export const persistentReducedStream = <State>(
  name: string,
  initialState: State,
  reducers: RegisteredReducer<State, any>[],
  action$: ActionStream,
  errorSubject: Subject<any> = defaultErrorSubject
): StateStream<State> => {
  const reducedState$ = action$.pipe(
    combineReducers(initialState, reducers, errorSubject),
    markName(name),
    tag(name)
  );
  return new StateStream(initialState, reducedState$);
};
