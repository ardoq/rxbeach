import {
  Operator,
  Subscriber,
  Subscribable,
  TeardownLogic,
  MonoTypeOperatorFunction,
  Observable,
} from 'rxjs';

export enum MarkerType {
  NAME,
  ACTION,
  OF_TYPE,
  COMBINE_LATEST,
  WITH_LATEST_FROM,
  MERGE,
  INVALID, // For test use
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

/**
 * A marker to name a stream
 */
export type NameMarker = MarkerBase<MarkerType.NAME> & {
  readonly name: string;
  readonly sources: [Marker | null];
};

/**
 * A marker representing an action creator
 */
export type ActionMarker = MarkerBase<MarkerType.ACTION> & {
  readonly name: string;
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
export type CombineLatestMarker = MarkerBase<MarkerType.COMBINE_LATEST> & {
  readonly sources: (Marker | null)[];
};

/**
 * A marker for the `withLatestFrom` operator
 */
export type WithLatestFromMarker = MarkerBase<MarkerType.WITH_LATEST_FROM> & {
  readonly sources: [Marker | null];
  readonly dependencies: (Marker | null)[];
};

export type MergeMarker = MarkerBase<MarkerType.MERGE> & {
  readonly sources: (Marker | null)[];
};

export type Marker =
  | NameMarker
  | ActionMarker
  | OfTypeMarker
  | CombineLatestMarker
  | WithLatestFromMarker
  | MergeMarker;

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

export const markCombineLatest = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.COMBINE_LATEST,
      sources: sources$.map(findMarker),
    })
  );

export const markWithLatestFrom = <T>(
  source$: Observable<unknown>,
  dependencies$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.WITH_LATEST_FROM,
      sources: [findMarker(source$)],
      dependencies: dependencies$.map(findMarker),
    })
  );

export const markMerge = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => observable$ =>
  observable$.lift(
    new MarkerOperator({
      type: MarkerType.MERGE,
      sources: sources$.map(findMarker),
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

/**
 * Detect possible glitches in a stream.
 *
 * A glitch occurs when a stream has multiple paths up its source or dependency
 * trees to the same source. When that is the case, the streams could be
 * evaluated in such an order so that that the stream recieves an
 * illegal/partial state, or subscribers are notified multiple times for what
 * should only be a single change.
 *
 * @param marker The marker to analyse the source and dependency trees for
 *               glitches
 * @param visited Implementation detail, please leave unset
 * @param parent Implementation detail, please leave unset
 * @returns An array of two markers, representing the two last steps in the path
 *          to the common source or dependency
 */
export const detectGlitch = (
  marker: MarkerInterface,
  visited = new Map<string, Marker[]>(),
  path: Marker[] = [marker as Marker]
): [Marker[], Marker[]] | false => {
  if (marker.sources === undefined && marker.dependencies === undefined) {
    return false;
  }

  if (marker.name !== undefined) {
    const previousPath = visited.get(marker.name);
    visited.set(marker.name, path);

    if (previousPath) return [previousPath, path];
  }

  const sources = [
    ...(marker.sources || []),
    ...(marker.dependencies || []),
  ].filter((m): m is Marker => m !== null);

  for (const source of sources) {
    const possibleGlitch = detectGlitch(source, visited, [...path, source]);
    if (possibleGlitch !== false) return possibleGlitch;
  }

  return false;
};
