import { UnknownAction } from '../internal/types';
import { defaultErrorSubject } from '../internal/defaultErrorSubject';
import { tag } from 'rxjs-spy/operators';
import { shareReplay, startWith } from 'rxjs/operators';
import { RegisteredReducer, combineReducers } from '../reducer';
import { OperatorFunction, Subject, pipe } from 'rxjs';

/**
 * Create a state stream for a set of reducers.
 *
 * It is guaranteed that the state stream will always emit a value upon subscription.
 *
 * The state stream is ref counted, which means that the stream
 * will reset to its `defaultState` when there are no subscribers.
 *
 * If you wish to persist the state throughout the application lifecycle,
 * you should create a subscriber that never unsubscribes.
 *
 * The values emitted from the stream are shared between the subscribers,
 * and the reducers are only ran once per input action.
 *.
 *
 * @param name A name for debugging purposes
 * @param action$ The action stream
 * @param defaultState The initial state of the state stream,
 *                     which is typically emitted upon subscription
 *                     unless one of the stream reducers emit straight away
 * @param reducers The reducer entries that are combined with `combineReducers`
 * @see rxbeach.combineReducers
 * @returns An stream that emits the reduced state
 */
export const reduceState = <State>(
  name: string,
  defaultState: State,
  reducers: RegisteredReducer<State, any>[],
  errorSubject: Subject<any> = defaultErrorSubject
): OperatorFunction<UnknownAction, State> =>
  pipe(
    combineReducers(defaultState, reducers, {
      errorSubject,
    }),
    startWith(defaultState),
    shareReplay({
      refCount: true,
      bufferSize: 1,
    }),
    tag(name)
  );
