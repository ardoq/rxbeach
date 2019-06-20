export type MetaModelId = string;

export interface MetaModelDefinition {
  name: string;
}

export interface PersistedMetaModel extends MetaModelDefinition {
  _id: MetaModelId;
}
