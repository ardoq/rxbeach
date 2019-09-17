import { combineReducers } from "reducer";
import { createStateStreamFactory } from "stateStream";

export const qualified$Factory = createStateStreamFactory(
  "test stream",
  combineReducers("no state"),
  "no state"
);
