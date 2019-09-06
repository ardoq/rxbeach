import { connectHookCreator, ActionStreamProps } from "recipes/reactConnect";
import { qualified$Factory } from "../qualified-stream";

const useViewModel = connectHookCreator<string>(qualified$Factory);

const ComplexComponent = ({ action$, dispatchAction }: ActionStreamProps) => {
  const [viewModel, qualifiedAction$, qualifiedDispatchAction] = useViewModel(
    action$,
    dispatchAction
  );

  return (
    <div>
      {viewModel.length === 0 ? (
        <p>No data!</p>
      ) : (
        <SimpleComponent
          action$={qualifiedAction$}
          dispatchAction={qualifiedDispatchAction}
        />
      )}
    </div>
  );
};

const SimpleComponent = ({ action$, dispatchAction }: ActionStreamProps) => {
  const [viewModel] = useViewModel(action$, dispatchAction);

  return (
    <div>
      <p>State is: {viewModel}</p>
    </div>
  );
};
