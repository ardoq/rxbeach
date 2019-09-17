import { useEffect, useState, createElement, ComponentType } from "react";
import { StateStreamFactory } from "stateStream";
import { ActionStream, ActionDispatcher } from "types/helpers";
import { Observable } from "rxjs";

/**
 * Utils for connecting a state stream factory to a React component.
 */

export const useStream = <T>(stream$: Observable<T>, initial: T) => {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const subscription = stream$.subscribe(v => {
      setValue(v);
    });

    return () => subscription.unsubscribe();
  }, [stream$]);

  return value;
};

export const connectHookCreator = <StateShape>(
  state$Factory: StateStreamFactory<StateShape>
) => (
  parentAction$: ActionStream,
  parentDispatchAction: ActionDispatcher
): [StateShape, ActionStream, ActionDispatcher] => {
  const [{ state$, action$, dispatchAction }] = useState(() => {
    return state$Factory(parentAction$, parentDispatchAction);
  });
  const viewModel = useStream(state$, state$Factory.seed);

  return [viewModel, action$, dispatchAction];
};

export type ActionStreamProps = {
  action$: ActionStream;
  dispatchAction: ActionDispatcher;
};

type ViewModelProp<StateShape> = {
  viewModel: StateShape;
};

export type ConnectProps<StateShape> = ActionStreamProps &
  ViewModelProp<StateShape>;

export const connectHOC = <StateShape>(
  state$Factory: StateStreamFactory<StateShape>,
  WrappedComponent: ComponentType<ActionStreamProps & ViewModelProp<StateShape>>
): ComponentType<ActionStreamProps> => {
  const useViewModel = connectHookCreator<StateShape>(state$Factory);

  return ({ action$, dispatchAction }: ActionStreamProps) => {
    const [viewModel, childAction$, childDispatchAction] = useViewModel(
      action$,
      dispatchAction
    );

    return createElement(WrappedComponent, {
      viewModel,
      action$: childAction$,
      dispatchAction: childDispatchAction
    });
  };
};
