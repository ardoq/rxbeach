import { equal } from "assert";
import { of } from "rxjs";
import { ReducerMap } from "reducer";
import { reduceActions } from "stateStream";
import { actionWithoutPayload, actionWithPayload } from "testUtils";

const throwErrorFn = () => {
  throw new Error();
};

describe("stateStream", function() {
  describe("reduceActions", function() {
    it("Should reduce actions to state", async function() {
      const incrementOneAction = actionWithoutPayload(Symbol("increment one"));

      const incrementManyAction = actionWithPayload(
        Symbol("increment many"),
        2
      );

      const reducers: ReducerMap<number> = new Map([
        [incrementOneAction.type, (total: number) => total + 1],
        [incrementManyAction.type, (a: number, b: number) => a + b]
      ]);

      const res = await of(
        incrementOneAction,
        incrementManyAction,
        incrementOneAction
      )
        .pipe(reduceActions(reducers, 1))
        .toPromise();

      equal(res, 5);
    });
    it("Should ignore reducers that throw errors", async function() {
      const throwError = actionWithoutPayload(Symbol("error"));
      const setState = actionWithPayload(Symbol("state"), true);

      const reducers: ReducerMap<boolean> = new Map([
        [throwError.type, throwErrorFn],
        [setState.type, (_: boolean, payload: boolean) => payload]
      ]);

      const res = await of(throwError, setState)
        .pipe(reduceActions(reducers, false))
        .toPromise();

      equal(res, true);
    });
  });
});
