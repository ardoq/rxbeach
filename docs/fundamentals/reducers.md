# Reducers

Reducers specify how the application state changes in response to actions sent to the store. Remember that actions only describe _what happened_, but don’t describe how the application’s state changes.

Reducers are used to build "reduced state streams", which are streams that use reducers to build state. Unlike Redux, RxBeach is built on the idea that there might be multiple reduced state streams in an application.

## Designing the state shape

Reducers organize the data in a stream. The stream should have a clear purpose, such as providing the necessary data to a view. We should be careful about what data is in each stream, and make sure it is neither more nor less than what we actually need. Nesting of data in the reducer is discouraged, to keep the complexity at a minimum.

To continue the example from the previous section, we can define the state shape and a default state for the module navigation in an app.

```typescript
enum Module {
  DASHBOARD
}
type NavigationState = {
  selectedModule: Module;
};
const defaultNavigationState: NavigationState = {
  selectedModule: Module.DASHBOARD
};
```

## Reducing over Actions

Reducers are pure functions, where the return value is only determined by its input values. It’s very important that the reducer stays pure. Given the same arguments, it should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Just a calculation.

A simple reducer for the `showModule` action, and `NavigationState` could be

```typescript
const handleShowModule = reducer(showModule, (state: NavigationState, payload) => {
  return {
    ...state,
    selectedModule: payload
  };
});
```

Notice where we provide the type for the state, and that the payload type is inferred. In this special case, we don't really need the `state` argument, as we change its only property, but it's nice to keep it to allow for extending the state shape later.

We can make the reducer definition shorter by using some tricks:

```typescript
const handleShowModule = reducer(showModule, (state: NavigationState, selectedModule) => ({
  ...state,
  selectedModule
}));
```

## Reducing over other streams

Instead of reacting to actions, reducers can react to other streams.
*TODO*

## Assembling reducers to streams

As mentioned, reducers are used in reduced state streams. These streams listen to the `action$`, and feed the actions to the appropriate reducers, and emit their results.

Here follows a simple example based on the code above

```typescript
const reducers = [handleShowModule];

const navigation$ = persistentReducedStream(
  'navigation$',
  defaultNavigationState,
  reducers
);
```
