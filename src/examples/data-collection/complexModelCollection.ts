import { OperatorFunction, pipe } from "rxjs";
import { map, flatMap, tap, switchMap } from "rxjs/operators";
import { action$, dispatchAction } from "examples/globalActions";
import {
  combineActionOperators,
  registerActionOperators
} from "lib/actionOperators";
import { collection, WithId, Collection } from "lib/recipes/collection";
import { actionRoutine } from "lib/routines/actionRoutine";
import { extractPayload } from "lib/utils/operators";

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
