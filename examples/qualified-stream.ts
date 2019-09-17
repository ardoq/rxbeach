import { combineReducers } from "stream-patterns/reducer";
import { createStateStreamFactory } from "stream-patterns/stateStream";

export const qualified$Factory = createStateStreamFactory(
  "test stream",
  combineReducers("no state"),
  "no state"
);
