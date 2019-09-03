import { createActionCreator } from "actionCreator";
import { tap } from "rxjs/operators";
import { hookRoutine } from "./hookRoutine";
import { equal, deepEqual } from "assert";
import { of } from "rxjs";

describe("routines", function() {
  const action = createActionCreator("action");

  describe("hookRoutine", function() {
    it("Should create an hookRoutine definition", async function() {
      let invoked = false;
      const epicDefinition = hookRoutine(tap(() => (invoked = true)), action);

      await of(action())
        .pipe(
          epicDefinition.operator,
          tap(() => {
            throw new Error("Actions should not leak past hookRoutines");
          })
        )
        .toPromise();

      equal(invoked, true);
      deepEqual(epicDefinition.types, [action.type]);
    });
  });
});
