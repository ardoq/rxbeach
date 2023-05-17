import type { ObservableInput } from 'rxjs';
import { ObservableState } from './observableState';
import { stateStreamRegistry } from './stateStreamRegistry';

/**
 * Make this stream a ObservableState stream of its source.
 *
 * @param name The unique name of this stream
 * @param source$ The source of this stream
 */
export const persistentDerivedStream = <State>(
  name: string,
  source$: ObservableInput<State>,
  initialState: State
): ObservableState<State> => {
  const stream = new ObservableState(name, source$, initialState);
  stateStreamRegistry.register(stream);
  return stream;
};
