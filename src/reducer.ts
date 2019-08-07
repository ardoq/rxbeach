import { createActionCreator } from "actionCreator";
import { ActionCreator, VoidPayload } from "types";

/*
 * Module with utils for creating and using reducers
 */

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
 * creator can be put directly into a `reducerMap` call.
 *
 * @param reducer The reducer function
 * @template `State` - The state the reducer reduces to
 * @template `Payload` - The payload of the action, fed to the reducer together
 *                       with the state
 * @returns An action creator for the payload, with the reducer stored on it
 *
 * @see reducerMap
 */
export const reducer = <State, Payload = VoidPayload>(
  reducer: Reducer<State, Payload>
): ReducerDefinition<State, Payload> => {
  const action: ActionCreator<Payload> = createActionCreator<Payload>("");
  const reducerEntry: ReducerEntry<State, Payload> = [action.type, reducer];

  return {
    ...action,
    reducer: reducerEntry
  };
};

/**
 * Create a map from action types to reducer functions
 *
 * @param reducers Action creator reducers, as returned by `reducer`
 * @returns A map from action types to reducer functions
 *
 * @see reducer
 */
export const reducerMap = <State>(
  ...reducers: ReducerDefinition<State, any>[]
): ReducerMap<State> => new Map(reducers.map(({ reducer }) => reducer));
