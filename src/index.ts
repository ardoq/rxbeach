// TYPES
export {
  ActionWithoutPayload,
  ActionWithPayload,
  Action
} from "./types/Action";
export {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  ActionCreator
} from "./types/ActionCreator";
export {
  ActionStream,
  ActionDispatcher,
  ExtractPayload
} from "./types/helpers";

export { actionCreator } from "./actionCreator";

export { reducer, combineReducers } from "./reducer";
export { namespaceActionCreator, namespaceActionDispatcher } from "./namespace";
