import { ActionCreator } from "types";

/*
 * Module with utils for creating and using reducers
 */

export type Reducer<State, Payload = void> = (
  previousState: State,
  payload: Payload
) => State;

export type ReducerMap<State> = Map<symbol, Reducer<State, any>>;

type ReducerEntry<State, Payload> = [symbol, Reducer<State, Payload>];

export const reducer = <State, Payload = void>(
  actionType: ActionCreator<Payload>,
  reducer: Reducer<State, Payload>
): ReducerEntry<State, Payload> => [actionType.type, reducer];
