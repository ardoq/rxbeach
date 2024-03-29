import { RegisteredReducer } from './reducer';
import { ObservableState } from './observableState';
import { stateStreamRegistry } from './stateStreamRegistry';
import { tag } from 'rxjs-spy/operators';
import {
  ReducedStreamOptions,
  reducedStream as reducedStreamInternal,
} from './internal/reducedStream';

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
 * @param name The name of the stream, used for placing a spy tag
 * @param initialState The initial state of the stream
 * @param reducers The reducers that build up the stream state
 */
export const persistentReducedStream = <State>(
  name: string,
  initialState: State,
  reducers: RegisteredReducer<State, any>[],
  options: ReducedStreamOptions = {}
): ObservableState<State> => {
  const source$ = reducedStreamInternal(initialState, reducers, options).pipe(
    tag(name)
  );

  const stream = new ObservableState(name, source$, initialState);

  stateStreamRegistry.register(stream);

  return stream;
};
