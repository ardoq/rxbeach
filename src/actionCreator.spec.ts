import { equal } from "assert";
import { createActionCreator } from "actionCreator";

describe("actionCreator", function() {
  describe("createActionCreator", function() {
    it("Should create action creators and append the type", function() {
      const myAction = createActionCreator<3>("three");
      const action = myAction(3);

      equal(action.type, myAction.type);
      equal(action.payload, 3);
    });
  });
});
