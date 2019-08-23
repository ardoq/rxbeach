import { getContext, actionWithoutPayload } from "testUtils";
import { map } from "rxjs/operators";
import { AnyAction, ActionWithoutPayload } from "types/Action";
import { saga } from "./sagas";
import { equal, deepEqual } from "assert";

const defaultContext = () => {
  const pongAction = actionWithoutPayload(Symbol("pong"));
  const sagaOp = map<ActionWithoutPayload, AnyAction>(() => pongAction);
  const ping = saga("ping", sagaOp);

  return {
    sagaOp,
    ping,
    pongAction
  };
};

describe("sagas", function() {
  describe("saga", function() {
    it("Should create a saga definition", function() {
      const { ping, sagaOp } = getContext(this, defaultContext);

      equal(ping.operator, sagaOp);
    });
    it("Should serve as an action creator", function() {
      const { ping } = getContext(this, defaultContext);

      const action = ping();

      deepEqual(action, {
        ...actionWithoutPayload(ping.type),
        payload: undefined
      });
    });
  });
});
