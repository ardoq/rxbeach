import { reducer, reducerMap } from "../../src/reducer";
import { action$ } from "../globalActionStream";
import { reduceToStateStream } from "../../src/stateStream";

export type ComplexModel = {
  id: number;
  parent: ComplexModel["id"];
  data: string;
};

/**
 * Util to make sure we do not change the order of the collection
 *
 * @param collection The collection to sort
 */
const sortCollection = (collection: CollectionState) => {
  return [...collection].sort((a, b) =>
    a.id < b.id ? -1 : a.id == b.id ? 0 : 1
  );
};

export type CollectionState = ComplexModel[];

/**
 * Replace the whole ComplexModel collection
 */
export const setComplexModels = reducer(
  (_: CollectionState, newModels: CollectionState) => sortCollection(newModels)
);

/**
 * Add a single ComplexModel to the collection
 */
export const addComplexModel = reducer(
  (collection: CollectionState, model: ComplexModel) =>
    sortCollection([...collection, model])
);

/**
 * Update a single ComplexModel in the collection.
 *
 * Works by doing the following:
 * ```
 * { ...existingModel, ...newModel }
 * ```
 */
export const replaceComplexModel = reducer(
  (collection: CollectionState, model: ComplexModel) =>
    collection.map(existing =>
      existing.id === model.id ? { ...existing, ...model } : existing
    )
);

/**
 * Remove a single ComplexModel from the collection
 */
export const removeComplexModel = reducer(
  (collection: CollectionState, modelId: number) =>
    collection.filter(({ id }) => id !== modelId)
);

////

export const reducers = reducerMap([
  setComplexModels.reducer,
  addComplexModel.reducer,
  replaceComplexModel.reducer,
  removeComplexModel.reducer
]);

export const complexModelCollection$ = action$.pipe(
  reduceToStateStream(
    "complexModelCollection$",
    reducers,
    [] as CollectionState
  )
);
