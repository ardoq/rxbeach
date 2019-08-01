import { useRef, useEffect, useState } from "react";
import { StateStreamFactory } from "stateStream";
import { ActionStream, ActionDispatcher, Action } from "types";
import { OperatorFunction, Observable } from "rxjs";

/**
 * Utils for connecting a state stream factory to a React component.
 */

type ViewModelPackage<ViewModel> = {
  viewModel: ViewModel;
  action$: ActionStream;
  dispatchAction: ActionDispatcher;
};

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
