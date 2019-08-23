import { equal } from "assert";
import { Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { ReducerDefinition, Reducer } from "reducer";
import { sameReducerFn, subscribeAndGuard } from "utils/utils";

describe("utils", function() {
  describe("subscribeAndGuard", function() {
    this.beforeAll(function() {
      this.originalConsoleError = console.error;
      console.error = (...args) => (this.hasLoggedErr = true);
    });
    this.beforeEach(function() {
      this.hasLoggedErr = false;
    });
    this.afterAll(function() {
      console.error = this.originalConsoleError;
    });

    it("Should subscribe to the stream", function() {
      const subject = new Subject<string>();

      let count = 0;
      const stream$ = subject.pipe(tap(arg => count++));

      const subscription = subscribeAndGuard(stream$);

      subject.next("one");
      subject.next("two");

      equal(count, 2);
      subscription.unsubscribe();
    });

    it("Should stay subscribed after error", function() {
      const subject = new Subject<string>();

      let count = 0;
      const stream$ = subject.pipe(
        tap(arg => {
          if (arg === "two") {
            throw new Error("Two");
          }
          count++;
        })
      );

      const subscription = subscribeAndGuard(stream$);

      subject.next("one");
      subject.next("two");
      subject.next("three");

      equal(this.hasLoggedErr, true);
      equal(count, 2);
      subscription.unsubscribe();
    });
  });

  describe("sameReducerFn", function() {
    it("Should extract the reducer from a reducer definition", function() {
      const reducer: Reducer<number, string> = (acc, payload) =>
        acc + payload.length;

      const reducerDefinition: ReducerDefinition<number, string> = {
        reducer: [Symbol(), reducer]
      } as any;

      equal(sameReducerFn(reducerDefinition), reducer);
    });
  });
});
