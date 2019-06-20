import action from "lib/action";
import { MetaModelId } from "../types";
import reducerBuilder from "lib/reducerBuilder";
import action$ from "action$";
import { reduceActionsStartWithDefault } from "lib/stream-operators";
import { shareReplay } from "rxjs/operators";

export enum MetaModelPane {
  LIST = "meta-model-list",
  SELECTED = "selected-meta-model"
}

export const selectMetaModelPane = action(
  "[navigation/metamodel] select pane"
).payload<{ pane: MetaModelPane }>();

export const selectMetaModel = action(
  "[navigation/metamodel] select model"
).payload<MetaModelId>();

const reducers = reducerBuilder<{
  pane: MetaModelPane;
  metaModel?: MetaModelId;
}>();

reducers.register(selectMetaModelPane, (state, { pane }) => ({
  ...state,
  pane
}));
reducers.register(selectMetaModel, (state, metaModel) => ({
  ...state,
  metaModel
}));

const metaModelNavigation$ = action$.pipe(
  reduceActionsStartWithDefault(reducers, { pane: MetaModelPane.LIST }),
  shareReplay({
    refCount: false,
    bufferSize: 1
  })
);

export default metaModelNavigation$;
