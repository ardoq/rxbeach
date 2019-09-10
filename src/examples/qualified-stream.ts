import { combineReducers } from "lib/reducer";
import { createStateStreamFactory } from "lib/stateStream";

export const qualified$Factory = createStateStreamFactory(
  "test stream",
  combineReducers("no state"),
  "no state"
);
