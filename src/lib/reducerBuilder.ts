import ActionCreator, {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload
} from "./ActionCreator";
import Reducer from "./Reducer";
import { PossiblyArray } from "./types";

interface RegisterReducer<State> {
  <Function extends Reducer<State, void>>(
    action: ActionCreatorWithoutPayload<any>,
    reducer: Function
  ): Function;

  // TODO - what if we want to unit test a reducer for an action with payload, that doesn't care about the payload, or neither the payload nor state?
  <Payload>(
    action: ActionCreatorWithPayload<any, Payload>,
    reducer: Reducer<State, Payload>
  ): Reducer<State, Payload>;

  <Payload>(
    actions: ActionCreatorWithPayload<any, Payload>[],
    reducer: Reducer<State, Payload>
  ): Reducer<State, Payload>;

  // TODO - can we infer an unioned payload type here, so there is no need for the
  //        payloads to be identical?
  <Payload = any>(
    actions: ActionCreatorWithPayload<any, Payload>[],
    reducer: Reducer<State, Payload>
  ): Reducer<State, Payload>;
}

export interface ReducerBuilder<State> {
  _reducers: {
    [type: string]: Reducer<State, any>;
  };

  /**
   * Register a reducer function for an action
   *
   * @param action An action, or list of actions to register the payload for
   * @param reducer The function to register as reducer for the action/actions
   */
  register: RegisterReducer<State>;
}

const reducerBuilder = <State>(): ReducerBuilder<State> => {
  const builder: ReducerBuilder<State> = {
    _reducers: {},

    register: <Payload>(
      action: PossiblyArray<ActionCreator<any, Payload>>,
      reducer: Reducer<State, Payload>
    ) => {
      if (action instanceof Array) {
        action.forEach(action => (builder._reducers[action.type] = reducer));
      } else {
        builder._reducers[action.type] = reducer;
      }

      return reducer;
    }
  };

  return builder;
};

export default reducerBuilder;
