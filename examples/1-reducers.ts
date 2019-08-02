import { reducer, ReducerMap } from "../src/reducer";

export type BasicStateShape = {
  data: string[];
};

export const appendRelevantData = reducer(
  (state: BasicStateShape, payload: { data: string[]; relevant: boolean }) => {
    if (payload.relevant) {
      return {
        data: state.data.concat(payload.data)
      };
    } else {
      return state;
    }
  }
);

export const reducers: ReducerMap<BasicStateShape> = new Map([
  appendRelevantData.reducer
]);
