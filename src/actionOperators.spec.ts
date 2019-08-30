import { actionWithoutPayload, toHistoryPromise } from "testUtils";
import { combineActionOperators } from "actionOperators";
import { mapTo, scan } from "rxjs/operators";
import { of } from "rxjs";
import { deepEqual } from "assert";

describe("actionOperators", function() {
  describe("combineActionOperators", function() {
    it("Should work", async function() {
      const one = actionWithoutPayload(Symbol("one"));
      const two = actionWithoutPayload(Symbol("two"));
      const three = actionWithoutPayload(Symbol("three"));
      const alpha = actionWithoutPayload(Symbol("alpha"));
      const bravo = actionWithoutPayload(Symbol("bravo"));

      const combined = combineActionOperators(
        {
          type: one.type,
          operator: mapTo(alpha)
        },
        {
          types: [two.type, three.type],
          operator: mapTo(bravo)
        }
      );

      const res = await toHistoryPromise(of(one, two, three).pipe(combined));

      deepEqual(res, [alpha, bravo, bravo]);
    });
  });
});
