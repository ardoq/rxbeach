import { useEffect, useState, createElement, ComponentType } from "react";
import { StateStreamFactory } from "stateStream";
import { ActionStream, ActionDispatcher } from "types";

/**
 * Utils for connecting a state stream factory to a React component.
 */

type ViewModelHook<ViewModel> = (
  action$: ActionStream,
  dispatchAction: ActionDispatcher
) => [ViewModel, ActionStream, ActionDispatcher];

export const connectHookCreator = <StateShape>(
  state$Factory: StateStreamFactory<StateShape>
): ViewModelHook<StateShape> => (parentAction$, parentDispatchAction) => {
  const [{ state$, action$, dispatchAction }] = useState(() =>
    state$Factory(parentAction$, parentDispatchAction)
  );
  const [viewModel, setViewModel] = useState<StateShape>(state$Factory.seed);

  useEffect(() => {
    const viewModelSubscription = state$.subscribe(viewModel =>
      setViewModel(viewModel)
    );

    return () => viewModelSubscription.unsubscribe();
  });

  return [viewModel, action$, dispatchAction];
};

export type ActionStreamProps = {
  action$: ActionStream;
  dispatchAction: ActionDispatcher;
};

export const connectHOC = <StateShape>(
  state$Factory: StateStreamFactory<StateShape>,
  WrappedComponent: ComponentType<StateShape>
) => {
  const useViewModel = connectHookCreator<StateShape>(state$Factory);

  return ({ action$, dispatchAction }: ActionStreamProps) => {
    const [viewModel] = useViewModel(action$, dispatchAction);

    // TODO - How do we pass down action$ and dispatchAction without requiring
    // the wrapped component to accept them?
    return createElement(WrappedComponent, viewModel);
  };
};
