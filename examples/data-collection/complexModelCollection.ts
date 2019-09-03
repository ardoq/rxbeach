import { action$, dispatchAction } from "../globalActions";
import { collection, WithId, Collection } from "recipes/collection";
import { OperatorFunction, pipe } from "rxjs";
import { map, flatMap, tap, switchMap } from "rxjs/operators";
import { extractPayload } from "utils/operators";
import {
  combineActionOperators,
  registerActionOperators
} from "actionOperators";
import { actionRoutine } from "routines/actionRoutine";

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
 */
export const deleteChildren = actionRoutine<ComplexModel["id"]>(
  "Delete children",
  pipe(
    extractPayload(),
    switchMap(parentId =>
      complexModelCollection$.pipe(pickComplexModelChildren(parentId))
    ),
    flatMap(children => children.map(({ id }) => removeComplexModel(id))),
    tap(dispatchAction)
  )
);

export const routines = combineActionOperators(deleteChildren);

// In a setup function
registerActionOperators(action$, routines);
