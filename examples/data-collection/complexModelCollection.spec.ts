import {
  ComplexModel,
  putComplexModel,
  complexModelCollection$,
  deleteChildren
} from "./complexModelCollection";
import { dispatchAction, action$ } from "../globalActions";
import { latest } from "testUtils";
import { deepEqual } from "assert";

describe("examples", function() {
  // The collection stream needs to be live for latest to work
  this.beforeEach(function() {
    this.subscription = complexModelCollection$.subscribe();
  });
  this.afterEach(function() {
    this.subscription.unsubscribe();
  });

  it("complexModelCollection", async function() {
    const complexA: ComplexModel = {
      id: "a",
      data: "This is a root thingy"
    };
    const complexB: ComplexModel = {
      id: "b",
      data: "This is also a root thingy"
    };
    const complexA1: ComplexModel = {
      id: "a1",
      parent: complexA.id,
      data: "This is a child"
    };
    const complexA2: ComplexModel = {
      id: "a2",
      parent: complexA.id,
      data: "This is also a child"
    };
    const complexB1: ComplexModel = {
      id: "b1",
      parent: complexB.id,
      data: "This is a child of B"
    };

    dispatchAction(putComplexModel(complexA));
    dispatchAction(putComplexModel(complexA2));
    dispatchAction(putComplexModel(complexA1));
    dispatchAction(putComplexModel(complexB));
    dispatchAction(putComplexModel(complexB1));

    let complexModels = await latest(complexModelCollection$);
    deepEqual(complexModels.contents, {
      a: complexA,
      b: complexB,
      a1: complexA1,
      a2: complexA2,
      b1: complexB1
    });

    dispatchAction(deleteChildren(complexA.id));

    complexModels = await latest(complexModelCollection$);
    deepEqual(complexModels.contents, {
      a: complexA,
      b: complexB,
      b1: complexB1
    });
  });
});
