import { ExtractPayload } from "../src/types";
import { reducer, ReducerMap, Reducer } from "../src/reducer";
import { myAction } from "./0-actions";

export type BasicStateShape = {
  data: string[];
};

const appendRelevantData: Reducer<
  BasicStateShape,
  ExtractPayload<typeof myAction>
> = (state, payload) => {
  if (payload.relevant) {
    return {
      data: state.data.concat(payload.data)
    };
  } else {
    return state;
  }
};

export const reducers: ReducerMap<BasicStateShape> = new Map([
  reducer(myAction, appendRelevantData)
]);
