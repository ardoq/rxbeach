import {
  BehaviorSubject,
  Observable,
  Subscription,
  Subject,
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
 * PersistentReducedStateStream is an Observable interface for state streams.
 *
 * The state stream has an inner subject which produces values to its subscribers.
 *
 * To begin reducing values, call `.startReducing(action$)`
 * To stop reducing, call `.stopReducing()` (this closes the inner subject)
 *
 * The latest value of the state stream can be read synchronously by accessing
 * `.state` (as long as the inner subject isn't closed)
 */
export class PersistentReducedStateStream<State> extends Observable<State> {
  private subject: BehaviorSubject<State>;
  private reducerSubscription?: Subscription;
  public name: string;
  private reducers: RegisteredReducer<State, any>[];
  private errorSubject: Subject<any>;

  /**
   * Subscribes to the action stream and starts reducing this state stream.
   * startReducing does not always immediately emit a value since the value
   * might have already been emitted when the state stream was created.
   *
   * initialState can be passed to reset the state of the stream to some other value.
   * This can be useful for hot-reloading
   *
   * startReducing will recreate the inner subject if it was previously closed
   */
  startReducing = (action$: ActionStream, initialState?: State) => {
    // Reset the subject value if it doesn't match the desired initialState
    // This is normally used for hot-reloading
    if (this.subject.closed && initialState) {
      this.subject = new BehaviorSubject(initialState);
    } else if (initialState && this.subject.value !== initialState) {
      this.subject.next(initialState);
    }
    // NOTE: .subscribe(this.subject) does not work
    // All tests pass with it, but in practice there are cases
    // where the subject isn't updated as expected
    this.reducerSubscription = action$
      .pipe(
        combineReducers(initialState || this.subject.value, this.reducers, {
          errorSubject: this.errorSubject,
        }),
        markName(this.name),
        tag(this.name)
      )
      .subscribe({
        complete: () => this.subject.complete(),
        error: (err) => this.subject.error(err),
        next: (state) => this.subject.next(state),
      });
    return this;
  };

  /**
   * Stop reducing this state stream and unsubscribe from the action$.
   *
   * Marks the inner subject as closed to prevent new subscriptions
   * (new subscriptions are allowed if the state stream is restarted)
   * https://ncjamieson.com/closed-subjects/
   */
  stopReducing = () => {
    if (this.reducerSubscription) {
      this.reducerSubscription.unsubscribe();
    }
    this.subject.unsubscribe();
  };

  constructor(
    name: string,
    initialState: State,
    reducers: RegisteredReducer<State, any>[],
    errorSubject: Subject<any> = defaultErrorSubject
  ) {
    super();
    this.name = name;
    this.subject = new BehaviorSubject(initialState);
    this.reducers = reducers;
    this.errorSubject = errorSubject;
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

  _trySubscribe(subscriber: Subscriber<State>): TeardownLogic {
    return this.subject._trySubscribe(subscriber);
  }

  _subscribe(subscriber: Subscriber<State>): Subscription {
    return this.subject._subscribe(subscriber);
  }
}

/**
 * Create a persistent reduced state stream
 *
 * This stream scans over an action stream and other streams to build up state.
 * It exposes its latest value through `.state`
 *
 * To start reducing state and subscribe to the action$,
 * you must first call `.startReducing(action$)` on the stream.
 *
 * The stream is intended to be used for persistent application state that is
 * started at application init and persisted throughout the application's lifecycle.
 *
 * ```
 * const myState$ = persistentReducedStream(
 *   'myState$',
 *   initialState,
 *   reducers
 * );
 *
 * myState$.value === initialState // Will be true
 *
 * myState$.startReducing(action$) // To start reducing
 * ```
 *
 * @param name The name of the stream, used for placing a marker and spy tag
 * @param initialState The initial state of the stream
 * @param reducers The reducers that build up the stream state
 */
export const persistentReducedStream = <State>(
  name: string,
  initialState: State,
  reducers: RegisteredReducer<State, any>[],
  errorSubject: Subject<any> = defaultErrorSubject
): PersistentReducedStateStream<State> => {
  return new PersistentReducedStateStream(
    name,
    initialState,
    reducers,
    errorSubject
  );
};
