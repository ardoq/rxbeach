import { of } from "rxjs";
import { deepEqual, equal } from "assert";
import { reducer, combineReducers } from "reducer";
import { actionWithPayload, beforeEach } from "testUtils";
import { VoidPayload } from "types/Action";

const throwErrorFn = () => {
  throw new Error();
};

describe("reducers", function() {
  describe("reducer", function() {
    const scaffolding = beforeEach(this, () => {
      const reducerFn = (totalLength: number, payload: string) =>
        totalLength + payload.length;

      const addString = reducer(reducerFn);
      const reducers = combineReducers(0, addString);

      return {
        reducerFn,
        addString,
        reducers
      };
    });

    it("Should store reducer function", function() {
      const { reducerFn, addString } = scaffolding(this);

      equal(addString.reducer[1], reducerFn);
    });
    it("Should create functioning action creator", function() {
      const { addString } = scaffolding(this);

      const action = addString("Hello");

      deepEqual(action, actionWithPayload(addString.type, "Hello"));
    });
  });

  describe("combineReducers", function() {
    it("Should reduce actions to state", async function() {
      const incrementOne = reducer((accumulator: number) => accumulator + 1);
      const incrementMany = reducer(
        (accumulator: number, increment: number) => accumulator + increment
      );

      const res = await of(incrementOne(), incrementMany(2), incrementOne())
        .pipe(combineReducers(1, incrementOne, incrementMany))
        .toPromise();

      equal(res, 5);
    });
    it("Should ignore reducers that throw errors", async function() {
      const throwError = reducer<boolean, VoidPayload>(throwErrorFn);
      const setState = reducer(() => true);

      const res = await of(throwError(), setState())
        .pipe(combineReducers(false, throwError, setState))
        .toPromise();

      equal(res, true);
    });
  });
});
