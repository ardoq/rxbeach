import { connectHOC } from "../../src/recipes/reactConnect";
import { qualified$Factory } from "../qualified-stream";

const SimpleComponent = (state: string) => (
  <div>
    <p>State is {state}</p>
  </div>
);

const SimpleComponentHOC = connectHOC(qualified$Factory, SimpleComponent);
