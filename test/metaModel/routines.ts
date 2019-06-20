import { dispatchAction } from "action$";
import { ofType, extractPayload } from "lib/stream-operators";
import {
  apiCreateMetaModel,
  addMetaModel,
  apiUpdateMetaModel,
  updateMetaModel,
  apiRefreshMetaModel,
  apiDeleteMetaModel,
  removeMetaModel,
  apiFetchMetaModels,
  setMetaModels
} from "./actions";
import { tap, withLatestFrom } from "rxjs/operators";
import { PersistedMetaModel } from "./types";
import metaModels$ from "./metaModels$";
import routineBuilder from "lib/routineBuilder";
import { pipe } from "rxjs";

const routines = routineBuilder();

routines.usesPayload(
  apiCreateMetaModel,
  tap(metaModelDef => {
    const persisted: PersistedMetaModel = {
      ...metaModelDef,
      _id: "asdf"
    };
    dispatchAction(addMetaModel(persisted));
  })
);

routines.any(
  pipe(
    ofType(apiUpdateMetaModel),
    extractPayload(),
    tap(metaModel => {
      dispatchAction(updateMetaModel(metaModel));
    })
  )
);

routines.usesPayload(
  apiRefreshMetaModel,
  pipe(
    withLatestFrom(metaModels$),
    tap(([metaModelId, metaModels]) => {
      const updatedModel = metaModels.find(({ _id }) => _id === metaModelId);
      if (!updatedModel) return;

      dispatchAction(updateMetaModel(updatedModel));
    })
  )
);

routines.usesPayload(
  apiDeleteMetaModel,
  tap(metaModelId => {
    dispatchAction(removeMetaModel(metaModelId));
  })
);

routines.ofType(
  apiFetchMetaModels,
  tap(() => {
    dispatchAction(setMetaModels([]));
  })
);

routines.any(tap(action => console.log("ACTION", action)));

routines.ofType<any>( // TODO - not perfect
  [
    apiCreateMetaModel,
    apiUpdateMetaModel,
    apiRefreshMetaModel,
    apiDeleteMetaModel,
    apiFetchMetaModels
  ],
  tap(action => console.log(`Executing action: ${action.type}`))
);

export default routines.start;
