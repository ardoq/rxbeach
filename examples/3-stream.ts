import { createStateStreamFactory } from "../src/stateStream";
import { BasicStateShape, reducers } from "./1-reducers";

const INITIAL_STATE: BasicStateShape = {
  data: []
};

export const basicState$Factory = createStateStreamFactory(
  "basic$",
  reducers,
  INITIAL_STATE
);
