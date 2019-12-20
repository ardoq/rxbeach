import {
  Operator,
  Subscriber,
  Subscribable,
  TeardownLogic,
  MonoTypeOperatorFunction,
  Observable,
} from 'rxjs';

export const enum MarkerType {
  ACTION,
  OF_TYPE,
  COMBINE,
  WITH_LATEST,
  NAME,
}

export type MarkerInterface = {
  /**
   * Type of the marker
   */
  readonly type: MarkerType;
  /**
   * The name of the stream
   *
   * Should be unique, and human readable.
   */
  readonly name?: string;
  /**
   * The streams that make this stream emit.
   *
   * `null` signifies streams without markers.
   */
  readonly sources?: (Marker | null)[];
  /**
   * Other streams this stream retrieves data from, but which does not trigger
   * this stream to emit.
   */
  readonly dependencies?: (Marker | null)[];
};

type MarkerBase<M extends MarkerType = MarkerType> = {
  readonly type: M;
};

type NamedMarker<M extends MarkerType> = MarkerBase<M> & {
  readonly name: string;
};

/**
 * A marker representing an action creator
 */
export type ActionMarker = NamedMarker<MarkerType.ACTION>;

/**
 * A marker to name a stream
 */
export type NameMarker = NamedMarker<MarkerType.NAME> & {
  readonly sources: [Marker | null];
};

/**
 * A marker for the `ofType` operator
 */
export type OfTypeMarker = MarkerBase<MarkerType.OF_TYPE> & {
  readonly sources: ActionMarker[];
};

/**
 * A marker for the `combineLatest` operator
 */
export type CombineMarker = MarkerBase<MarkerType.COMBINE> & {
  readonly sources: (Marker | null)[];
};

/**
 * A marker for the `withLatestFrom` operator
 */
export type WithLatestMarker = MarkerBase<MarkerType.WITH_LATEST> & {
  readonly sources: [Marker | null];
  readonly dependencies: (Marker | null)[];
};

export type Marker =
  | WithLatestMarker
  | CombineMarker
  | OfTypeMarker
  | NameMarker
  | ActionMarker;

export const actionMarker = (name: string): ActionMarker => ({
  type: MarkerType.ACTION,
  name,
});

export class MarkerOperator<T, M extends Marker> implements Operator<T, T> {
  readonly marker: M;

  constructor(marker: M) {
    this.marker = marker;
  }

  call(subscriber: Subscriber<T>, source: Subscribable<T>): TeardownLogic {
    return source.subscribe(subscriber);
  }
}

export const markName = <T>(
  name: string
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.NAME,
      sources: [findMarker(observable$)],
      name,
    })
  );

export const markOfType = <T>(
  sources: ActionMarker[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.OF_TYPE,
      sources,
    })
  );

export const markCombine = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.COMBINE,
      sources: sources$.map(findMarker),
    })
  );

export const markWithLatest = <T>(
  source$: Observable<unknown>,
  dependencies$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.WITH_LATEST,
      sources: [findMarker(source$)],
      dependencies: dependencies$.map(findMarker),
    })
  );

export const findMarker = (observable$: Observable<unknown>): Marker | null => {
  if (observable$.operator instanceof MarkerOperator) {
    return observable$.operator.marker;
  } else if (observable$.source instanceof Observable) {
    return findMarker(observable$.source);
  } else {
    return null;
  }
};
