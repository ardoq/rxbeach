# Collections

An app usually need data of different types, called "models", and there will
often be multiple instances of each model. The structure that stores the model
instances on the front end is called a collection.

> The legacy version of collections in Ardoq front is Backbone collections.
> They provide dual functionality - they both store the model instances, and
> they automatically perform REST calls when the collections are modified.

Ardoq actions provides a stream based structure for collections. The
`collection` util takes a model type, a collection name and an action stream and
returns a collection stream and the action-reducers needed to modify the
collection.

> There will come tooling that removes the need to pass in the action stream to
> `collection`

## Example

This is a small example showcasing the simplicity of creating collections with
the `collection` utility.

```typescript
import { action$, dispatchAction } from "action$";
import { collection } from "ardoq-actions/recipes/collection";
import { MetaModel } from "meta-model/types";

const [
  metaModels$,
  putMetaModel,
  removeMetaModel,
  replaceMetaModels
] = collection<MetaModel>("metaModels", action$);

// metaModels$ will not emit each time the meta model collection changes
// Let's demonstrate
dispatchAction(putMetaModel(metaModel("My new meta model")));

// metaModels$ would now emit the collection with one element - the meta model
```

## Details

### Global, qualified action-reducers

The action-reducers returned by the `collection` function are not created on a
per collection basis, they are actually shared across all collections.
Qualifiers are used to separate them from each other. Elsewhere in Ardoq actions
we have opted to qualify the `dispatchAction` function itself, but for
`collection` we have added a qualifying wrapper around each action. The result
is the same, but allows for more flexibility among the users of `collection`.

## Examples

- [Example in the repo](https://github.com/ardoq/ardoq-actions/tree/master/src/examples/data-collection)
