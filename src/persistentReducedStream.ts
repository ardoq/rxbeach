import { Subject } from 'rxjs';
import { RegisteredReducer } from './reducer';
import { PersistentReducedStateStream } from './persistentReducedStateStream';
import { stateStreamRegistry } from './stateStreamRegistry';

type PersistentReducedStreamOptions = {
  errorSubject?: Subject<any>;
  namespace?: string;
};

/**
 * Creates and registers a persistent reduced state stream
 *
 * This stream scans over an action stream and other streams to build up state.
 * It exposes its latest value through `.state`
 *
 * To start reducing state and subscribe to the action$, you must first call
 * `.startReducing(action$)` on the stream.
 * Because the stream will be registered in the stateStreamRegistry,
 * `startReducing` will be invoked on this stream when
 * `stateStreamRegistry.startReducing(action$)` is called.
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
  { errorSubject, namespace }: PersistentReducedStreamOptions = {}
): PersistentReducedStateStream<State> => {
  const stream = new PersistentReducedStateStream(
    name,
    initialState,
    reducers,
    errorSubject,
    namespace
  );

  stateStreamRegistry.register(stream);

  return stream;
};
