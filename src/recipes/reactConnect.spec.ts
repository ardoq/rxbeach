import { renderHook } from "@testing-library/react-hooks";
import { equal, strictEqual } from "assert";
import { Subject } from "rxjs";
import { ActionDispatcher } from "stream-patterns/types/helpers";
import { reducer, combineReducers } from "stream-patterns/reducer";
import { createStateStreamFactory } from "stream-patterns/stateStream";
import { testStream, beforeEach } from "stream-patterns/testUtils";
import { AnyAction } from "stream-patterns/types/Action";
import { useStream, connectHookCreator } from "./reactConnect";

describe("reactConnect", function() {
  describe("useStream", function() {
    const scaffolding = beforeEach(this, () => {
      const initial = "alfa";
      const emit = ["bravo", "charlie"];
      const [obs$, subscriptions] = testStream(...emit);
      const hook = renderHook(() => useStream(obs$, initial));

      return {
        ...hook,
        initial,
        emit,
        obs$,
        subscriptions
      };
    });
    this.afterEach(function() {
      scaffolding(this).unmount();
    });

    it("should first return initial value", async function() {
      const { result } = scaffolding(this);

      equal(result.current, "alfa");
    });
    it("should return emitted values", async function() {
      const { result, waitForNextUpdate } = scaffolding(this);

      await waitForNextUpdate();
      equal(result.current, "bravo");
    });
    it("should unsubscribe on unmount", async function() {
      const { subscriptions, unmount } = scaffolding(this);

      equal(subscriptions.value, 1, "subscribed");
      unmount();

      equal(subscriptions.value, 0, "unsubscribed");
    });
  });
  describe("connectHookCreator", function() {
    const scaffolding = beforeEach(this, () => {
      const increment = reducer<number>(a => a + 1);
      const count$Factory = createStateStreamFactory(
        "count",
        combineReducers(0, increment),
        0
      );

      const useCount = connectHookCreator(count$Factory);
      const action$ = new Subject<AnyAction>();
      const dispatchAction: ActionDispatcher = a => action$.next(a);

      const hook = renderHook(
        ({ action$, dispatchAction }) => useCount(action$, dispatchAction),
        {
          initialProps: {
            action$,
            dispatchAction
          }
        }
      );
      const dispatchIncrement = () => hook.result.current[2](increment());

      return {
        ...hook,
        dispatchIncrement
      };
    });
    this.afterEach(function() {
      scaffolding(this).unmount();
    });

    it("should receive values", async function() {
      const { result, rerender, dispatchIncrement } = scaffolding(this);

      equal(result.current[0], 0);

      dispatchIncrement();
      // This should be await waitForNextUpdate(), but for some reason, that
      // doesn't work...
      rerender();

      equal(result.current[0], 1);
    });

    it("should keep the same stream and dispatcher", async function() {
      const { result, rerender } = scaffolding(this);

      const [, action$1, dispatchAction1] = result.current;

      rerender();

      const [, action$2, dispatchAction2] = result.current;
      strictEqual(action$1, action$2);
      strictEqual(dispatchAction1, dispatchAction2);
    });
  });
});
