import action from "lib/action";
import { PersistedMetaModel, MetaModelId, MetaModelDefinition } from "./types";

// CRUD like
export const setMetaModels = action("[metamodel] set models").payload<
  PersistedMetaModel[]
>();

export const addMetaModel = action("[metamodel] add model").payload<
  PersistedMetaModel
>();

export const updateMetaModel = action("[metamode] update model").payload<
  PersistedMetaModel
>();

export const removeMetaModel = action("[metamodel] remove model").payload<
  MetaModelId
>();

// API requests
export const apiFetchMetaModels = action("[metamodel] [api] fetch models")
  .noPayload;

export const apiCreateMetaModel = action(
  "[metamodel] [api] create model"
).payload<MetaModelDefinition>();

export const apiUpdateMetaModel = action(
  "[metamodel] [api] update model"
).payload<PersistedMetaModel>();

export const apiRefreshMetaModel = action(
  "[metamodel] [api] refresh model"
).payload<MetaModelId>();

export const apiDeleteMetaModel = action(
  "[metamodel] [api] delete model"
).payload<MetaModelId>();
