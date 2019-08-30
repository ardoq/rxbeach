import { actionWithoutPayload, toHistoryPromise } from "testUtils";
import {
  combineActionOperators,
  registerActionOperators
} from "actionOperators";
import { mapTo, scan } from "rxjs/operators";
import { of } from "rxjs";
import { deepEqual, equal } from "assert";
import { ActionDispatcher } from "types/helpers";
import { AnyAction } from "types/Action";

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
  describe("registerActionOperators", function() {
    it("Should work", async function() {
      let lastAction: AnyAction | null = null;
      const dispatchAction: ActionDispatcher = action => (lastAction = action);

      const one = actionWithoutPayload(Symbol("one"));
      const two = actionWithoutPayload(Symbol("two"));

      const s = registerActionOperators(of(one), dispatchAction, mapTo(two));

      equal(lastAction, two);

      s.unsubscribe();
    });
  });
});
