# Connecting views to streams

When connecting a view to an application state, it is important to maintain the separation of concerns. Since the view layer is likely to change often through an application's development lifecycle, we must ensure that making changes to a view is simple.

In an RxBeach application, we achieve this by ensuring that the view connects to a `viewModel$` stream, which maps the data to a suitable format for the view. As a result, the view does not depend directly on any application streams. The view only depends on being "fed" a viewModel in the correct format.

## In React

We connect react components to streams with the `connect` higher-order
component.

```typescript
type ViewModel = {
  number: number;
};

const View = ({ number }: ViewModel) => {
  return <p>Value: {number}</p>;
};

const ConnectedView = connect(View, viewModel$);
```
