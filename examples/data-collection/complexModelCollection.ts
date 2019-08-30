import { action$, dispatchAction } from "../globalActions";
import { collection, WithId, Collection } from "recipes/collection";
import { OperatorFunction, pipe } from "rxjs";
import { map, flatMap, tap, switchMap } from "rxjs/operators";
import { saga } from "routines/sagas";
import { extractPayload } from "utils/operators";
import {
  combineActionOperators,
  registerActionOperators
} from "actionOperators";

export type ComplexModel = WithId & {
  parent?: ComplexModel["id"];
  data: string;
};

export const [
  complexModelCollection$,
  putComplexModel,
  removeComplexModel,
  replaceComplexModels
] = collection<ComplexModel>("complexModels", action$);

/**
 * Stream operator that accepts a collection of ComplexModel, and emits a
 * collection of the ComplexModels that are children of the given parent
 * ComplexModel.
 *
 * @param parentId The id of the ComplexModel to pick the children of
 */
export const pickComplexModelChildren = (
  parentId: string
): OperatorFunction<Collection<ComplexModel>, ComplexModel[]> =>
  map(({ contents }) =>
    Object.values(contents).filter(({ parent }) => parent === parentId)
  );

/**
 * Delete all the children of a ComplexModel
 *
 * Note: This is a saga because:
 *  1. It should be an action in itself (epics are not)
 *  2. It only return actions that should be emitted to the action stream (routines do not)
 */
export const deleteChildren = saga<ComplexModel["id"]>(
  "Delete children",
  pipe(
    extractPayload(),
    switchMap(parentId =>
      complexModelCollection$.pipe(pickComplexModelChildren(parentId))
    ),
    flatMap(children => children.map(({ id }) => removeComplexModel(id)))
  )
);

export const routines = combineActionOperators(deleteChildren);

// In a setup function
registerActionOperators(action$, dispatchAction, routines);
