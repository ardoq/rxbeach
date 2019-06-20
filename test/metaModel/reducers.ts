import { InferredReducer } from "lib/types";
import { PersistedMetaModel } from "./types";
import {
  setMetaModels,
  addMetaModel,
  removeMetaModel,
  updateMetaModel
} from "./actions";
import reducerBuilder from "lib/reducerBuilder";

export type MetaModelsStateType = PersistedMetaModel[];

const reducers = reducerBuilder<MetaModelsStateType>();

// Pattern 1 - inline the reducers in register call for less boilerplate
reducers.register(setMetaModels, (_, models) => models);
reducers.register(addMetaModel, (models, model) => [...models, model].sort());

// Pattern 2 - Like the existing pattern
const handleRemoveMetaModel: InferredReducer<
  MetaModelsStateType,
  typeof removeMetaModel
> = (models, id) => models.filter(({ _id }) => _id !== id);

const handleUpdateMetaModel: InferredReducer<
  MetaModelsStateType,
  typeof updateMetaModel
> = (models, updatedModel) =>
  [...handleRemoveMetaModel(models, updatedModel._id), updatedModel].sort();

reducers.register(removeMetaModel, handleRemoveMetaModel);
reducers.register(updateMetaModel, handleUpdateMetaModel);

export default reducers;
