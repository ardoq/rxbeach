import { OperatorFunction, ReplaySubject } from "rxjs";
import { map, filter, flatMap } from "rxjs/operators";
import { CollectionState } from "./complexModelCollection$";

/**
 * Util operator that turned out to be unecessary
 */
const filterUndefined = <T>(): OperatorFunction<T | undefined, T> =>
  filter((e): e is T => e !== undefined);

/**
 * Stream operator that accepts a collection of ComplexModel, and emits a
 * collection of the ComplexModels that are children of the given parent
 * ComplexModel.
 *
 * @param parentId The id of the ComplexModel to pick the children of
 */
export const pickComplexModelChildren = (
  parentId: number
): OperatorFunction<CollectionState, CollectionState> =>
  map(collection =>
    Object.fromEntries(
      Object.entries(collection).filter(([, { parent }]) => parent === parentId)
    )
  );

/**
 * Takes a stream of an array, and returns a stream where each of the items of
 * the array will be emited after each other
 */
export const explode = <T>(): OperatorFunction<T[], T> =>
  flatMap(elements => {
    const observableElements = new ReplaySubject<T>();
    elements.forEach(element => observableElements.next(element));

    return observableElements;
  });
