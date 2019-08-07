import { of } from "rxjs";
import { deepEqual } from "assert";
import { createChildDispatcher, createChildActionStream } from "qualifiers";
import { actionWithoutPayload } from "testUtils";
import { AnyAction, ActionDispatcher } from "types";

describe("qualifiers", function() {
  describe("createChildDispatcher", function() {
    it("Should invoke the parent dispatcher with qualified actions", function() {
      let dispatchedAction: AnyAction | undefined;
      const parentDispatcher: ActionDispatcher = action =>
        (dispatchedAction = action);

      const parentQualifier = Symbol("parent");
      const qualifier = Symbol("child");
      const childDispatcher = createChildDispatcher(
        parentDispatcher,
        qualifier
      );

      const action = actionWithoutPayload(Symbol("action"), [parentQualifier]);

      childDispatcher(action);

      deepEqual(dispatchedAction, {
        payload: undefined,
        ...actionWithoutPayload(action.type, [qualifier, parentQualifier])
      });
    });
  });

  describe("createChildActionStream", function() {
    it("Should filter and strip qualifiers", async function() {
      const qualifier = Symbol("qualifier");
      const type = Symbol("type");

      const res = await createChildActionStream(
        of(
          actionWithoutPayload(Symbol("wrong action")),
          actionWithoutPayload(type, [qualifier])
        ),
        qualifier
      ).toPromise();

      deepEqual(res, {
        type: type,
        meta: { qualifiers: [] }
      });
    });
  });
});
