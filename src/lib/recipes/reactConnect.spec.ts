import { renderHook } from "@testing-library/react-hooks";
import { useStream } from "./reactConnect";
import { equal } from "assert";
import { testStream } from "lib/testUtils";

describe("reactConnect", function() {
  describe("useStream", function() {
    it("should first return initial, then emitted values", async function() {
      const [obs$, subscriptions] = testStream("bravo", "charlie");
      const { result, waitForNextUpdate, unmount } = renderHook(() =>
        useStream(obs$, "alfa")
      );

      equal(subscriptions.value, 1, "subscribed");
      equal(result.current, "alfa");

      await waitForNextUpdate();
      equal(result.current, "bravo");

      // "charlie" is still left to be dispatched
      // unmounting the hook to check that it unsubscribes
      unmount();
      equal(subscriptions.value, 0, "unsubscribed");
    });
  });
});
