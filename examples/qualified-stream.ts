import { createStateStreamFactory } from "stateStream";
import { combineReducers } from "reducer";

export const qualified$Factory = createStateStreamFactory(
  "test stream",
  combineReducers("no state"),
  "no state"
);
