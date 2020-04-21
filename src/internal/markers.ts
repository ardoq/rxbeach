import { MonoTypeOperatorFunction, Observable } from 'rxjs';

export enum MarkerType {
  NAME,
  ACTION,
  OF_TYPE,
  COMBINE_LATEST,
  WITH_LATEST_FROM,
  MERGE,
  ZIP,
  DEBOUNCE_TIME,
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

export type ZipMarker = MarkerBase<MarkerType.ZIP> & {
  readonly sources: (Marker | null)[];
};

export type DebounceTimeMarker = MarkerBase<MarkerType.DEBOUNCE_TIME> & {
  readonly sources: [Marker | null];
  readonly time: number;
};

export type Marker =
  | NameMarker
  | ActionMarker
  | OfTypeMarker
  | CombineLatestMarker
  | WithLatestFromMarker
  | MergeMarker
  | ZipMarker
  | DebounceTimeMarker;

export const actionMarker = (name: string): ActionMarker => ({
  type: MarkerType.ACTION,
  name,
});

/**
 * An Observable with a marker field
 *
 * The Observable does not have it's own subscription function. Instead
 * subscription is defered to the source. This means the marker is only visible
 * when inspecting the Observable, and that it does not add extra function calls
 * when subscribed.
 */
export class MarkedObservable<T, M extends Marker> extends Observable<T> {
  readonly marker: M;

  constructor(source: Observable<T>, marker: M) {
    // When the observable has no subscription function (empty constructor call)
    // and no operator, but does have a source, the `subscribe` method will just
    // subscribe the source
    super();
    this.source = source;

    this.marker = marker;
  }
}

export const markName = <T>(name: string): MonoTypeOperatorFunction<T> => (
  observable$
) =>
  new MarkedObservable(observable$, {
    type: MarkerType.NAME,
    sources: [findMarker(observable$)],
    name,
  });

export const markOfType = <T>(
  sources: ActionMarker[]
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.OF_TYPE,
    sources,
  });

export const markCombineLatest = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.COMBINE_LATEST,
    sources: sources$.map(findMarker),
  });

export const markWithLatestFrom = <T>(
  source$: Observable<unknown>,
  dependencies$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.WITH_LATEST_FROM,
    sources: [findMarker(source$)],
    dependencies: dependencies$.map(findMarker),
  });

export const markMerge = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.MERGE,
    sources: sources$.map(findMarker),
  });

export const markZip = <T>(
  sources$: Observable<unknown>[]
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.ZIP,
    sources: sources$.map(findMarker),
  });

export const markDebounceTime = <T>(
  source$: Observable<unknown>,
  time: number
): MonoTypeOperatorFunction<T> => (observable$) =>
  new MarkedObservable(observable$, {
    type: MarkerType.DEBOUNCE_TIME,
    sources: [findMarker(source$)],
    time,
  });

export const findMarker = (observable$: Observable<unknown>): Marker | null => {
  if (observable$ instanceof MarkedObservable) {
    return observable$.marker;
  } else if (observable$.source instanceof Observable) {
    return findMarker(observable$.source);
  }
  return null;
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
