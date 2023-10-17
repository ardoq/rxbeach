export { action$, dispatchAction } from './action$';

export type {
  ActionWithoutPayload,
  ActionWithPayload,
  Action,
} from './types/Action';
export type {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  ActionCreator,
} from './types/ActionCreator';
export type {
  ActionStream,
  ActionDispatcher,
  ExtractPayload,
  Observed,
  InferPayloadFromActionCreator,
} from './types/helpers';

export {
  actionCreator,
  isValidRxBeachAction,
  isActionOfType,
} from './actionCreator';

export {
  reducer,
  actionReducer,
  streamReducer,
  combineReducers,
  Reducer,
  RegisteredReducer,
} from './reducer';

export { namespaceActionCreator, namespaceActionDispatcher } from './namespace';

export {
  Routine,
  subscribeRoutine,
  routine,
  collectRoutines,
  tapRoutine,
} from './routines';

export { derivedStream } from './derivedStream';
export { reducedStream } from './reducedStream';

export { persistentDerivedStream } from './persistentDerivedStream';
export { persistentReducedStream } from './persistentReducedStream';
export { ObservableState } from './observableState';

export { stateStreamRegistry } from './stateStreamRegistry';
