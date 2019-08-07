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

export const reducerMap = <State>(
  reducers: ReducerEntry<State, any>[]
): ReducerMap<State> => new Map(reducers);
