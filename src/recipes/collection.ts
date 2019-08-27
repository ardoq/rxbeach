import { createQualifiedStateStream } from "stateStream";
import { ActionStream, ActionDispatcher } from "types/helpers";
import { combineReducers, reducer } from "reducer";
import { createQualifiedActionCreator } from "qualifiers";
import { Observable } from "rxjs";
import { ActionCreatorWithPayload } from "types/ActionCreator";
import { removeComplexModel } from "../../examples/data-collection/complexModelCollection$";

type IdType = string;

export interface WithId {
  id: IdType;
}

type CollectionContent<Model extends WithId = WithId> = { [id: string]: Model };
export type Collection<Model extends WithId = WithId> = {
  contents: CollectionContent<Model>;
};

const EMPTY_COLLECTION: Collection<any> = { contents: {} };

const _putModel = reducer<Collection, WithId>(({ contents }, model) => ({
  contents: {
    ...contents,
    [model.id]: model
  }
}));

const _removeModel = reducer<Collection, IdType>((state, removeId) => {
  const { [removeId]: remove, ...contents } = state.contents;
  return { contents };
});

const _replaceModels = reducer<Collection, CollectionContent>(
  (_, contents) => ({ contents })
);

const reducers = combineReducers(
  EMPTY_COLLECTION,
  _putModel,
  _removeModel,
  _replaceModels
);

export const collection = <Model extends WithId>(
  name: string,
  action$: ActionStream
): [
  Observable<Collection<Model>>,
  ActionCreatorWithPayload<Model>,
  ActionCreatorWithPayload<IdType>,
  ActionCreatorWithPayload<CollectionContent<Model>>
] => {
  const [_collection$, , qualifier] = createQualifiedStateStream(
    name,
    reducers,
    EMPTY_COLLECTION,
    action$
  );

  const collection$ = _collection$ as Observable<Collection<Model>>;
  const putModel = createQualifiedActionCreator(
    qualifier,
    _putModel
  ) as ActionCreatorWithPayload<any>;
  const replaceModels = createQualifiedActionCreator(
    qualifier,
    _replaceModels
  ) as ActionCreatorWithPayload<CollectionContent<any>>;
  const removeModel = createQualifiedActionCreator(qualifier, _removeModel);

  return [collection$, putModel, removeModel, replaceModels];
};
