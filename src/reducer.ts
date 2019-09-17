import { OperatorFunction, pipe } from "rxjs";
import { scan } from "rxjs/operators";
import { createActionCreator } from "actionCreator";
import { VoidPayload, AnyAction, UnknownAction } from "types/Action";
import { ActionCreator } from "types/ActionCreator";
import { ofType } from "utils/operators";

export type Reducer<State, Payload = VoidPayload> = (
  previousState: State,
  payload: Payload
) => State;

export type ReducerMap<State> = Map<symbol, Reducer<State, any>>;

type ReducerEntry<State, Payload> = [symbol, Reducer<State, Payload>];

export type ReducerDefinition<State, Payload> = ActionCreator<Payload> & {
  reducer: ReducerEntry<State, Payload>;
};

/**
 * Create a reducer and its corresponding action
 *
 * This function doesn't alter the passed the reducer, but serves as a nice way
 * of adding typings to it.
 *
 * It returns an action creator with the reducer stored on it. This action
 * creator can be put directly into a `combineReducers` call.
 *
 * @param reducer The reducer function
 * @template `State` - The state the reducer reduces to
 * @template `Payload` - The payload of the action, fed to the reducer together
 *                       with the state
 * @returns An action creator for the payload, with the reducer stored on it
 *
 * @see combineReducers
 */
export const reducer = <State, Payload = VoidPayload>(
  reducer: Reducer<State, Payload>
): ReducerDefinition<State, Payload> => {
  type PartialDefinition = Partial<ReducerDefinition<State, any>> &
    ActionCreator<Payload>;

  const definition: PartialDefinition = createActionCreator("");
  definition.reducer = [definition.type, reducer];

  return definition as ReducerDefinition<State, Payload>;
};

/**
 * Combine the reducers into a stream operator
 *
 * The payload of each incoming action is applied to the matching reducers
 * together with the previous state (or the seed if it's the first invocation),
 * and the returned state is emitted.
 *
 * This operator does not change whether the stream is hot or cold.
 *
 * @param seed The initial input to the first reducer call
 * @param reducers The reducer actions that should be combined
 */
export const combineReducers = <State>(
  seed: State,
  ...reducers: ReducerDefinition<State, any>[]
): OperatorFunction<AnyAction, State> => {
  const reducerMap = new Map(reducers.map(({ reducer }) => reducer));
  return pipe(
    ofType(...reducerMap.keys()),
    scan((state: State, { type, payload }: UnknownAction) => {
      const reducer = reducerMap.get(type);
      if (reducer) {
        try {
          return reducer(state, payload);
        } catch (_) {
          return state;
        }
      } else {
        return state;
      }
    }, seed)
  );
};
