import { pipe } from "rxjs";
import { flatMap } from "rxjs/operators";
import { routine } from "routines/routines";
import { extractPayload } from "utils/operators";
import {
  ComplexModel,
  complexModelCollection$,
  removeComplexModel
} from "./complexModelCollection$";
import { pickComplexModelChildren } from "./operators";

/**
 * Delete all the children of a ComplexModel
 */
export const deleteChildren = routine<ComplexModel["id"]>(
  "Delete children",
  pipe(
    extractPayload(),
    flatMap(parentId =>
      complexModelCollection$.pipe(pickComplexModelChildren(parentId))
    ),
    flatMap(children =>
      Object.entries(children).map(([, { id }]) => removeComplexModel(id))
    )
  )
);
