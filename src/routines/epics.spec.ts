import { createActionCreator } from "actionCreator";
import { filter } from "rxjs/operators";
import { epic } from "./epics";
import { ActionWithoutPayload } from "types";
import { equal, deepEqual } from "assert";

describe("epics", function() {
  const action = createActionCreator("action");
  const noopEpic = filter<ActionWithoutPayload>(() => false);

  describe("epic", function() {
    it("Should create an epic definition", function() {
      const epicDefinition = epic(noopEpic, action);

      equal(epicDefinition.operator, noopEpic);
      deepEqual(epicDefinition.types, [action.type]);
    });
  });
});
