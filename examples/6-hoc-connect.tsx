import { connectHOC } from "../src/connect";
import { BasicStateShape } from "./1-reducers";
import { basicState$Factory } from "./3-stream";

const SimpleComponent = ({ data }: BasicStateShape) => (
  <div>
    <ul>
      {data.map(entry => (
        <li>{entry}</li>
      ))}
    </ul>
  </div>
);

const SimpleComponentHOC = connectHOC(basicState$Factory, SimpleComponent);
