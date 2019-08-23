import { reducer, combineReducers } from "reducer";
import { reduceToStateStream } from "stateStream";
import { sameReducerFn } from "utils/utils";
import { action$ } from "../globalActions";

export type ComplexModel = {
  id: number;
  parent: ComplexModel["id"];
  data: string;
};

export type CollectionState = { [id: number]: ComplexModel };

/**
 * Replace the whole ComplexModel collection
 */
export const setComplexModels = reducer(
  (_: CollectionState, newModels: CollectionState) => newModels
);

/**
 * Add a single ComplexModel to the collection
 */
export const addComplexModel = reducer(
  (collection: CollectionState, model: ComplexModel) => ({
    ...collection,
    [model.id]: model
  })
);

/**
 * Update a single ComplexModel in the collection.
 */
export const replaceComplexModel = reducer(sameReducerFn(addComplexModel));

/**
 * Remove a single ComplexModel from the collection
 */
export const removeComplexModel = reducer(
  (collection: CollectionState, modelId: number) =>
    Object.fromEntries(
      Object.entries(collection).filter(([key]) => key != `${modelId}`)
    )
);

////
const initialState: CollectionState = {};
export const reducerOperator = combineReducers(
  initialState,
  setComplexModels,
  addComplexModel,
  replaceComplexModel,
  removeComplexModel
);

export const complexModelCollection$ = action$.pipe(
  reduceToStateStream("complexModelCollection$", reducerOperator, initialState)
);
