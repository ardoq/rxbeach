import { createActionCreator } from "actionCreator";
import { filter, map } from "rxjs/operators";
import { epic, epicSet, attachEpics } from "./epics";
import { ActionWithoutPayload, AnyAction } from "types";
import { equal, deepEqual, doesNotReject } from "assert";
import { Subject } from "rxjs";
import { actionWithoutPayload, checkActions } from "testUtils";

describe("epics", function() {
  const action = createActionCreator("action");
  const noopEpic = filter<ActionWithoutPayload>(() => false);

  describe("epic", function() {
    it("Should create an epic definition", function() {
      const epicDefinition = epic(noopEpic, action);

      equal(epicDefinition.epic, noopEpic);
      deepEqual(epicDefinition.actions, [action.type]);
    });
  });

  describe("epicSet", function() {
    it("Should collect epics to set", function() {
      const epicDefinition = epic(noopEpic, action);

      const epics = epicSet(epicDefinition);

      deepEqual(epics, new Set([epicDefinition]));
    });
  });

  describe("attachEpics", function() {
    it("Should attach epics to the stream", async function() {
      const action$ = new Subject<AnyAction>();
      const dispatchAction = action$.next.bind(action$);
      const ping = createActionCreator("ping");
      const pong = actionWithoutPayload(Symbol("pong"));

      const epics = epicSet(epic(map(() => pong), ping));

      const promise = checkActions(action$, [
        ({ type }) => equal(type, ping.type),
        ({ type }) => equal(type, pong.type)
      ]);

      const epicSubscription = attachEpics(action$, dispatchAction, epics);
      action$.next(ping());

      await promise;
      epicSubscription.unsubscribe();
    });
  });
});
