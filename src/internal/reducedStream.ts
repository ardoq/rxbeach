import { RegisteredReducer, combineReducers } from '../reducer';
import { action$ as defaultAction$ } from '../action$';
import { Observable, Subject } from 'rxjs';
import { ActionStream } from '../types/helpers';
import { withNamespace } from '../operators';

export type ReducedStreamOptions = {
  errorSubject?: Subject<any>;
  namespace?: string;
  action$?: ActionStream;
};

/**
 * Creates a simple reduced state stream (without tagging, making sure to have initial state, nor replay)
 *
 * @param initialState The initial state of the stream
 * @param reducers The reducers that build up the stream state
 * @param {ReducedStreamOptions} options
 * @returns
 */
export const reducedStream = <State>(
  initialState: State,
  reducers: RegisteredReducer<State, any>[],
  {
    errorSubject,
    namespace,
    action$ = defaultAction$,
  }: ReducedStreamOptions = {}
): Observable<State> => {
  const filteredAction$ =
    namespace === undefined ? action$ : action$.pipe(withNamespace(namespace));

  const source$ = filteredAction$.pipe(
    combineReducers(initialState, reducers, {
      errorSubject: errorSubject,
      namespace: namespace,
    })
  );
  return source$;
};
