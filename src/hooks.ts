import { Marker, findMarker } from './internal/markers';
import { Observable } from 'rxjs';

type Hook<T> = (payload: T) => void;
type RemoveHook = () => void;

const markerHooks = new Set<Hook<Marker>>();

/**
 * Register a hook for new markers
 *
 * The hook will be invoked every time a stream with a marker is subscribed.
 * This can be from `subscribeRoutine`, `useStream` or `connect`.
 *
 * @param hook The hook that will be invoked
 * @returns A function to remove/unsubscribe the hook
 */
export const hookMarkers = (hook: Hook<Marker>): RemoveHook => {
  markerHooks.add(hook);
  return () => markerHooks.delete(hook);
};

/**
 * Notify the hooks system that a stream has been subscribed.
 *
 * If a marker can be found on the observable, the marker hooks will be invoked.
 *
 * Can be used to invoke the marker hook for streams that are subscribed without
 * RxBeach tooling.
 *
 * @param stream The stream that has been subscribed
 * @see rxbeach/interal#findMarker
 */
export const notifyStreamSubscribed = (stream: Observable<unknown>) => {
  const marker = findMarker(stream);
  if (marker === null) return;

  for (const hook of markerHooks) {
    hook(marker);
  }
};

/**
 * Remove all hooks
 */
export const clearHooks = () => {
  markerHooks.clear();
};
