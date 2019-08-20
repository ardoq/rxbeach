import { routine } from "./routines";
import { tap } from "rxjs/operators";
import { deepEqual } from "assert";
import { actionWithPayload } from "testUtils";
import { of } from "rxjs";

describe("routines", function() {
  describe("routine", function() {
    it("Should create a routine definition", async function() {
      const testRoutine = routine("test routine", tap(() => {}));

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
      const testRoutine = routine<string>("test routine", tap(() => {}));
      const action = testRoutine("Hello");

      deepEqual(action, actionWithPayload(testRoutine.type, "Hello"));
    });
  });
});
