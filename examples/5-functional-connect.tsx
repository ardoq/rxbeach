import { connectHookCreator, ActionStreamProps } from "../src/connect";
import { ActionDispatcher, ActionStream } from "../src/types";
import { BasicStateShape } from "./1-reducers";
import { basicState$Factory } from "./3-stream";

const useViewModel = connectHookCreator<BasicStateShape>(basicState$Factory);

const ComplexComponent = ({ action$, dispatchAction }: ActionStreamProps) => {
  const [viewModel, qualifiedAction$, qualifiedDispatchAction] = useViewModel(
    action$,
    dispatchAction
  );

  return (
    <div>
      {viewModel.data.length === 0 ? (
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
      <ul>
        {viewModel.data.map(entry => (
          <li>{entry}</li>
        ))}
      </ul>
    </div>
  );
};
