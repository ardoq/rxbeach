import { routine, routineSet, subscribeRoutines } from "./routines";
import { tap } from "rxjs/operators";
import { equal, deepEqual } from "assert";
import { actionWithPayload } from "testUtils";
import { of } from "rxjs";
import { ActionWithPayload } from "types";

const defaultContext = () => {
  const lastPayloadHolder: { payload: undefined | string } = {
    payload: undefined
  };
  const routineOp = tap(({ payload }: ActionWithPayload<string>) => {
    lastPayloadHolder.payload = payload;
  });
  const someSideeffect = routine<string>("someSideeffect", routineOp);
  const routines = routineSet(someSideeffect);

  return {
    routineOp,
    someSideeffect,
    routines,
    lastPayloadHolder
  };
};
const getContext = (
  mochaContext: Mocha.Context
): ReturnType<typeof defaultContext> => {
  if (mochaContext.context === undefined) {
    mochaContext.context = defaultContext();
  }
  return mochaContext.context;
};

describe("routines", function() {
  this.beforeEach(function() {});
  describe("routine", function() {
    it("Should create a routine definition", function() {
      const { someSideeffect, routineOp } = getContext(this);

      equal(someSideeffect.routine, routineOp);
    });
    it("Should serve as an action creator", function() {
      const { someSideeffect } = getContext(this);
      const action = someSideeffect("Hello");

      deepEqual(action, actionWithPayload(someSideeffect.type, "Hello"));
    });
  });
  describe("routineSet", function() {
    it("Should return a Set of routines", function() {
      const { routines, someSideeffect } = getContext(this);

      deepEqual(routines, new Set([someSideeffect]));
    });
  });
  describe("subscribeRoutines", function() {
    it("Should subscribe the routines to an action$", function() {
      const { someSideeffect, routines, lastPayloadHolder } = getContext(this);
      const action$ = of(someSideeffect("Hello"));

      subscribeRoutines(action$, routines);

      equal(lastPayloadHolder.payload, "Hello");
    });
  });
});
