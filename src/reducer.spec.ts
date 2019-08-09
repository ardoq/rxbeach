import { deepEqual, equal } from "assert";
import { reducer, reducerMap } from "reducer";
import { actionWithPayload, getContext } from "testUtils";

const defaultContext = () => {
  const reducerFn = (totalLength: number, payload: string) =>
    totalLength + payload.length;

  const addString = reducer(reducerFn);
  const reducers = reducerMap(addString);

  return {
    reducerFn,
    addString,
    reducers
  };
};

describe("reducers", function() {
  describe("reducer", function() {
    it("Should store reducer function", function() {
      const { reducerFn, addString } = getContext(this, defaultContext);

      equal(addString.reducer[1], reducerFn);
    });
    it("Should create functioning action creator", function() {
      const { addString } = getContext(this, defaultContext);

      const action = addString("Hello");

      deepEqual(action, actionWithPayload(addString.type, "Hello"));
    });
  });
  describe("reducerMap", function() {
    it("Should map reducer actions to reducer functions", function() {
      const { reducers, addString, reducerFn } = getContext(
        this,
        defaultContext
      );

      deepEqual(reducers, new Map([[addString.type, reducerFn]]));
    });
  });
});
