import {
  BehaviorSubject,
  InteropObservable,
  Observable,
  ObservableInput,
  Subscribable,
  Subscription,
  Unsubscribable,
  from,
} from 'rxjs';
import { patch } from 'rxjs-interop';

/**
 * ObservableState is an Observable interface for state streams.
 * At its core, ObservableState multicasts a source Observable and makes the latest value available.
 *
 * You can start the stream by calling the {@link connect | connect()} method and destory it with {@link unsubscribe | unsubscribe()}
 *
 * The latest value of the state stream can be read synchronously by accessing
 * `.state` (as long as the inner subject isn't destroyed)
 */
export class ObservableState<State>
  implements InteropObservable<State>, Subscribable<State>, Unsubscribable
{
  private subject: BehaviorSubject<State>;
  private subscription?: Subscription;
  private source$: Observable<State>;
  public name: string;

  public subscribe: Observable<State>['subscribe'];
  public pipe: Observable<State>['pipe'];

  /**
   * Create a new ObservableState.
   *
   * Will not consume `source$` until {@link connect} has been called.
   *
   * @param name The name to store for the ObservableState, used by the stateStreamRegistry and for dev tools
   * @param source$ The observable this ObservableState will get it's values from
   * @param initialState The initial value of `.state` until `source$` has emitted a value
   */
  constructor(
    name: string,
    source$: ObservableInput<State>,
    initialState: State
  ) {
    this.source$ = from(source$);
    this.name = name;
    this.subject = new BehaviorSubject(initialState);

    this.subscribe = this.subject.subscribe.bind(this.subject);
    this.pipe = this.subject.pipe.bind(this.subject);

    // rxjs-interop/patch handles fallback from Symbol.observable to
    // "@@observable" for the cases when the user of rxbeach hasn't polyfilled
    // Symbol.observable
    patch(this);
  }

  /**
   * @deprecated Only for use by RxJS
   */
  [Symbol.observable](): Subscribable<State> {
    return {
      subscribe: this.subscribe,
    };
  }

  /**
   * Start consuming the source observable. In effect, this "starts the work".
   */
  connect = () => {
    if (this.destroyed) {
      throw new Error('ObservableState has been destroyed');
    }
    this.subscription = this.source$.subscribe(this.subject);

    // NOTE: .subscribe(this.subject) does not work
    // All tests pass with it, but in practice there are cases
    // where the subject isn't updated as expected
    // .subscribe({
    //   complete: () => this.subject.complete(),
    //   error: (err) => this.subject.error(err),
    //   next: (state) => this.subject.next(state),
    // });
  };

  /**
   * Stop reducing this state stream and unsubscribe from the source observable.
   *
   * Accessing the `.state` property or subscribing after calling this method will throw an
   * exception.
   */
  unsubscribe = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subject.unsubscribe();
  };

  get state(): State {
    return this.subject.getValue();
  }
  get destroyed(): boolean {
    return this.subject.closed;
  }
}
