import { deepEqual } from "assert";
import { Subject } from "rxjs";
import { toHistoryPromise } from "stream-patterns/testUtils";
import { AnyAction } from "stream-patterns/types/Action";
import { WithId, collection, Collection } from "./collection";

interface SomeModel extends WithId {
  data: symbol;
}

describe("collection", function() {
  it("Should create a working collection$", async function() {
    const action$ = new Subject<AnyAction>();
    const [collection$, putModel, removeModel, replaceModels] = collection<
      SomeModel
    >("SomeModel collection", action$);

    const collectionHistory = toHistoryPromise(collection$);

    const modelA: SomeModel = { id: "a", data: Symbol("a") };
    const modelA2: SomeModel = { id: "a", data: Symbol("a2") };
    const modelB: SomeModel = { id: "b", data: Symbol("b") };

    const expectedHistory: Collection<SomeModel>[] = [
      // Seed is empty collection
      {},
      // Put model A
      { [modelA.id]: modelA },
      // Put model B
      { [modelA.id]: modelA, [modelB.id]: modelB },
      // Replace model A with model A2 (Have same id)
      { [modelA2.id]: modelA2, [modelB.id]: modelB },
      // Delete model B
      { [modelA2.id]: modelA2 },
      // Replace all with model B
      { [modelB.id]: modelB }
    ].map(contents => ({ contents }));

    action$.next(putModel(modelA));
    action$.next(putModel(modelB));
    action$.next(putModel(modelA2));
    action$.next(removeModel(modelB.id));
    action$.next(replaceModels({ [modelB.id]: modelB }));

    action$.complete();
    deepEqual(await collectionHistory, expectedHistory);
  });
  it("Should handle multiple collections on the same action$", async function() {
    const action$ = new Subject<AnyAction>();
    const [collection1$, putModel1] = collection<SomeModel>("1", action$);
    const [collection2$, putModel2] = collection<SomeModel>("2", action$);

    const collection1History = toHistoryPromise(collection1$);
    const collection2History = toHistoryPromise(collection2$);

    const modelA: SomeModel = { id: "a", data: Symbol("a") };
    const modelB: SomeModel = { id: "b", data: Symbol("b") };

    const expectedHistory1: Collection<SomeModel>[] = [
      {},
      { [modelA.id]: modelA }
    ].map(contents => ({ contents }));
    const expectedHistory2: Collection<SomeModel>[] = [
      {},
      { [modelB.id]: modelB }
    ].map(contents => ({ contents }));

    action$.next(putModel1(modelA));
    action$.next(putModel2(modelB));

    action$.complete();
    deepEqual(await collection1History, expectedHistory1);
    deepEqual(await collection2History, expectedHistory2);
  });
});
