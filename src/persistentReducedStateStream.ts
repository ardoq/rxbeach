import {
  BehaviorSubject,
  Observable,
  Operator,
  Subject,
  Subscriber,
  Subscription,
  TeardownLogic,
} from 'rxjs';
import { ActionStream } from './types/helpers';
import { RegisteredReducer, combineReducers } from './reducer';
import { defaultErrorSubject } from './internal/defaultErrorSubject';
import { markName } from './internal/markers';
import { tag } from 'rxjs-spy/operators';
import { withNamespace } from './operators';

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
  private errorSubject: Subject<any>;
  private subject: BehaviorSubject<State>;
  private reducerSubscription?: Subscription;
  private reducers: RegisteredReducer<State, any>[];
  private namespace?: string;

  public name: string;

  constructor(
    name: string,
    initialState: State,
    reducers: RegisteredReducer<State, any>[],
    errorSubject: Subject<any> = defaultErrorSubject,
    namespace?: string
  ) {
    super();
    this.name = name;
    this.subject = new BehaviorSubject(initialState);
    this.reducers = reducers;
    this.errorSubject = errorSubject;
    this.namespace = namespace;
  }

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
    if (initialState !== undefined) {
      if (this.subject.closed) {
        this.subject = new BehaviorSubject(initialState);
      } else if (this.subject.value !== initialState) {
        this.subject.next(initialState);
      }
    }

    const seed = initialState === undefined ? this.subject.value : initialState;

    const filteredAction$ =
      this.namespace === undefined
        ? action$
        : action$.pipe(withNamespace(this.namespace));

    this.reducerSubscription = filteredAction$
      .pipe(
        combineReducers(seed, this.reducers, {
          errorSubject: this.errorSubject,
          namespace: this.namespace,
        }),
        markName(this.name),
        tag(this.name)
      )
      // NOTE: .subscribe(this.subject) does not work
      // All tests pass with it, but in practice there are cases
      // where the subject isn't updated as expected
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
   * Accessing the `.state` property after calling this method will throw an
   * exception.
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
