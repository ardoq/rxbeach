import { equal, deepEqual } from "assert";
import { of, OperatorFunction, Subject, pipe } from "rxjs";
import { tap, reduce, filter } from "rxjs/operators";
import { ReducerDefinition, Reducer } from "reducer";
import { actionWithPayload, actionWithoutPayload } from "testUtils";
import { ActionWithPayload, ActionWithoutPayload } from "types";
import {
  extractPayload,
  ofType,
  sameReducerFn,
  subscribeAndGuard,
  fork
} from "utils";

const pipeActionWithPayload = <P, R>(
  payload: P,
  pipe: OperatorFunction<ActionWithPayload<P>, R>
): Promise<R> =>
  of(actionWithPayload(Symbol(), payload))
    .pipe(pipe)
    .toPromise();

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

  describe("extractPayload", function() {
    const tests = [
      ["primitive", "Hello World"],
      ["array", ["Hello", { what: "World" }]],
      ["object", { foo: true }]
    ];

    for (const [name, payload] of tests) {
      it(`Should extract ${name} payload`, async function() {
        const res = await pipeActionWithPayload(payload, extractPayload());

        equal(res, payload);
      });
    }
  });

  describe("ofType", function() {
    it("Should filter one action type", async function() {
      const targetType = Symbol("Correct type");
      const otherType = Symbol("Wrong type");

      await of<ActionWithoutPayload>(
        actionWithoutPayload(targetType),
        actionWithoutPayload(otherType),
        actionWithoutPayload(targetType)
      )
        .pipe(
          ofType(targetType),
          tap(action => equal(action.type, targetType))
        )
        .toPromise();
    });

    it("Should filter multiple action types", async function() {
      const targetType1 = Symbol("Correct type one");
      const targetType2 = Symbol("Correct type two");
      const otherType = Symbol("Wrong type");

      const collectedTypes = await of<ActionWithoutPayload>(
        actionWithoutPayload(targetType1),
        actionWithoutPayload(otherType),
        actionWithoutPayload(targetType2)
      )
        .pipe(
          ofType(targetType1, targetType2),
          reduce((acc, { type }) => [...acc, type], [] as symbol[])
        )
        .toPromise();

      deepEqual(collectedTypes, [targetType1, targetType2]);
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

  describe("fork", function() {
    it("Should Run each pipe in parallel", async function() {
      let aCount = 0;
      let bCount = 0;
      let beforeCount = 0;

      const subj = new Subject<{ type: "A" | "B" }>();
      const promise = subj
        .pipe(
          tap(() => (beforeCount += 1)),
          fork(
            pipe(
              filter(({ type }) => type === "A"),
              tap(() => (aCount += 1))
            ),
            pipe(
              filter(({ type }) => type === "B"),
              tap(() => (bCount += 1))
            )
          )
        )
        .toPromise();

      subj.next({ type: "A" });
      subj.next({ type: "B" });
      subj.complete();

      await promise;

      equal(beforeCount, 2, "Parent pipe should be hot");
      equal(aCount, 1, "Pipe A should run in isolation");
      equal(bCount, 1, "Pipe B should run in isolation");
    });
  });
});
