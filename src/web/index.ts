import { collection, WithId } from "~lib/recipes/collection";
import { action$ } from "~examples/globalActions";

console.log("We are in the browser!");

interface Timestamp extends WithId {
  timestamp: Date;
}

const [timestampCollection$, putTime] = collection<Timestamp>(
  "timestamps",
  action$
);
