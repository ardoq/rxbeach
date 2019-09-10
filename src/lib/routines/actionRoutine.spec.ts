import { deepEqual } from "assert";
import { of } from "rxjs";
import { tap } from "rxjs/operators";
import { actionWithPayload } from "lib/testUtils";
import { actionRoutine } from "./actionRoutine";

describe("routines", function() {
  describe("actionRoutine", function() {
    it("Should create a actionRoutine definition", async function() {
      const testRoutine = actionRoutine("test routine", tap(() => {}));

      await of(testRoutine())
        .pipe(
          testRoutine.operator,
          tap(() => {
            throw new Error("Actions should not leak past routines");
          })
        )
        .toPromise();
    });
    it("Should serve as an action creator", function() {
      const testRoutine = actionRoutine<string>("test routine", tap(() => {}));
      const action = testRoutine("Hello");

      deepEqual(action, actionWithPayload(testRoutine.type, "Hello"));
    });
  });
});
