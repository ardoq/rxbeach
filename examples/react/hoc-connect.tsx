import { connectHOC, ConnectProps } from "recipes/reactConnect";
import { qualified$Factory } from "../qualified-stream";
import { action$, dispatchAction } from "../globalActions";

const SimpleComponent = ({ viewModel }: ConnectProps<string>) => (
  <div>
    <p>State is {viewModel}</p>
  </div>
);

const SimpleComponentHOC = connectHOC(qualified$Factory, SimpleComponent);

const a = (
  <SimpleComponentHOC action$={action$} dispatchAction={dispatchAction} />
);
