import { equal, deepEqual } from "assert";
import { of, OperatorFunction } from "rxjs";
import { tap, reduce } from "rxjs/operators";
import { ActionWithPayload, ActionWithoutPayload } from "types";
import { extractPayload, ofType, ofTypes, sameReducerFn } from "./utils";
import { ReducerDefinition, Reducer } from "reducer";
import { number } from "prop-types";

const emptyAction: ActionWithoutPayload = {
  meta: { qualifiers: [] },
  type: Symbol()
};

const pipeActionWithPayload = <P, R>(
  payload: P,
  pipe: OperatorFunction<ActionWithPayload<P>, R>
): Promise<R> => {
  const action: ActionWithPayload<P> = {
    ...emptyAction,
    payload
  };

  return of(action)
    .pipe(pipe)
    .toPromise();
};

describe("utils", function() {
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
    it("Should filter the correct action type", async function() {
      const targetType = Symbol("Correct type");
      const otherType = Symbol("Wrong type");

      await of<ActionWithoutPayload>(
        { ...emptyAction, type: targetType },
        { ...emptyAction, type: otherType },
        { ...emptyAction, type: targetType }
      )
        .pipe(
          ofType(targetType),
          tap(action => equal(action.type, targetType))
        )
        .toPromise();
    });
  });

  describe("ofTypes", function() {
    it("Should filter the correct action types", async function() {
      const targetType1 = Symbol("Correct type one");
      const targetType2 = Symbol("Correct type two");
      const otherType = Symbol("Wrong type");

      const collectedTypes = await of<ActionWithoutPayload>(
        { ...emptyAction, type: targetType1 },
        { ...emptyAction, type: otherType },
        { ...emptyAction, type: targetType2 }
      )
        .pipe(
          ofTypes([targetType1, targetType2]),
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
});
