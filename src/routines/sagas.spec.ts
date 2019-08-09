import { getContext, actionWithoutPayload, checkActions } from "testUtils";
import { map } from "rxjs/operators";
import { AnyAction, ActionWithoutPayload } from "types";
import { saga, sagaSet, attachSagas } from "./sagas";
import { equal, deepEqual } from "assert";
import { Subject } from "rxjs";

const defaultContext = () => {
  const pongAction = actionWithoutPayload(Symbol("pong"));
  const sagaOp = map<ActionWithoutPayload, AnyAction>(() => pongAction);
  const ping = saga("ping", sagaOp);
  const sagas = sagaSet(ping);

  return {
    sagaOp,
    ping,
    pongAction,
    sagas
  };
};

describe("sagas", function() {
  describe("saga", function() {
    it("Should create a saga definition", function() {
      const { ping, sagaOp } = getContext(this, defaultContext);

      equal(ping.saga, sagaOp);
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
  describe("sagaSet", function() {
    it("Should collect sagas into a Set", function() {
      const { ping, sagas } = getContext(this, defaultContext);

      deepEqual(sagas, new Set([ping]));
    });
  });
  describe("attachSagas", function() {
    it("Should attach sagas to the stream", async function() {
      const action$ = new Subject<AnyAction>();
      const dispatchAction = action$.next.bind(action$);

      const { ping, pongAction, sagas } = getContext(this, defaultContext);

      const promise = checkActions(action$, [
        ({ type }) => equal(type, ping.type),
        ({ type }) => equal(type, pongAction.type)
      ]);

      const subscription = attachSagas(action$, dispatchAction, sagas);
      action$.next(ping());

      await promise;
      subscription.unsubscribe();
    });
  });
});
