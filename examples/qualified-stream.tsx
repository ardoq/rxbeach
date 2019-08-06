import { createStateStreamFactory } from "../src/stateStream";

export const qualified$Factory = createStateStreamFactory(
  "test stream",
  new Map(),
  "no state"
);
