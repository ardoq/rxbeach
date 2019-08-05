import {
  ComplexModel,
  complexModelCollection$,
  removeComplexModel
} from "./complexModelCollection$";
import { pipe } from "rxjs";
import { extractPayload } from "../../src/utils";
import { flatMap } from "rxjs/operators";
import { routine } from "../../src/routines";
import { pickComplexModelChildren } from "./operators";

/**
 * Delete all the children of a ComplexModel
 */
export const deleteChildren = routine<ComplexModel["id"]>(dispatchAction =>
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
