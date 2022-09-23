import { Observable, shareReplay, startWith } from 'rxjs';
import { RegisteredReducer } from './reducer';
import { tag } from 'rxjs-spy/operators';
import {
  ReducedStreamOptions,
  reducedStream as reducedStreamInternal,
} from './internal/reducedStream';

/**
 * Creates reduced state stream
 *
 * This stream scans over an action stream and other streams to build up state.
 *
 * To start reducing state,  you must first subscribe to the action$
 * (connecting a component using the React HOC ```connect``` would be enough)
 *
 * The state stream is ref counted, which means that the stream
 * will reset to its `defaultState` when there are no subscribers.
 *
 * If you wish to persist the state throughout the application lifecycle,
 * you should use ```persistentReducedStream```.
 *
 * It is guaranteed that the state stream will always emit a value upon subscription.
 *
 * The values emitted from the stream are shared between the subscribers,
 * and the reducers are only ran once per input action.
 *
 * @param name The name of the stream, used for placing a spy tag
 * @param initialState The initial state of the stream
 * @param reducers The reducers that build up the stream state
 */
export const reducedStream = <State>(
  name: string,
  initialState: State,
  reducers: RegisteredReducer<State, any>[],
  options: ReducedStreamOptions = {}
): Observable<State> => {
  return reducedStreamInternal(initialState, reducers, options).pipe(
    startWith(initialState),
    shareReplay({
      refCount: true,
      bufferSize: 1,
    }),
    tag(name)
  );
};
