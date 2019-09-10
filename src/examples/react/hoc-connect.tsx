import React from "react";
import { action$, dispatchAction } from "examples/globalActions";
import { qualified$Factory } from "examples/qualified-stream";
import { connectHOC, ConnectProps } from "lib/recipes/reactConnect";

const SimpleComponent = ({ viewModel }: ConnectProps<string>) => (
  <div>
    <p>State is {viewModel}</p>
  </div>
);

const SimpleComponentHOC = connectHOC(qualified$Factory, SimpleComponent);

const a = (
  <SimpleComponentHOC action$={action$} dispatchAction={dispatchAction} />
);
