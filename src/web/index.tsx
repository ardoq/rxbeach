import React from "react";
import ReactDOM from "react-dom";
import * as rxjsSpy from "rxjs-spy";
import { collection, WithId } from "~lib/recipes/collection";
import { action$, dispatchAction } from "~examples/globalActions";
import { map } from "rxjs/operators";
import { useStream } from "~lib/recipes/reactConnect";

console.log("We are in the browser!");
rxjsSpy.create();

interface Timestamp extends WithId {
  timestamp: Date;
}

const [timestampCollection$, putTime] = collection<Timestamp>(
  "timestamps",
  action$
);

const addTimestamp = () => {
  const date = new Date();
  const timestamp = {
    id: date.toISOString(),
    timestamp: date
  };

  dispatchAction(putTime(timestamp));
};

const Clicker = () => <button onClick={addTimestamp}>Add timestamp</button>;

const timestampList$ = timestampCollection$.pipe(
  map(collection => Object.values(collection.contents))
);

const TimestampList = () => {
  const timestamps = useStream(timestampList$, []);

  return (
    <ul>
      {timestamps.map(({ id, timestamp }) => (
        <li key={id}>{timestamp.toISOString()}</li>
      ))}
    </ul>
  );
};

const Container = () => (
  <div>
    <p style={{ width: "800px" }}>
      This example posts timestamps to a collection when the button is clicked.
      You can try to observe the values with rxjs-spy. Try for example the
      following in the console:
    </p>
    <pre>spy.show();{"\n"}spy.log('action$ - collection - timestamps');</pre>
    <Clicker />
    <TimestampList />
  </div>
);

ReactDOM.render(<Container />, document.getElementById("container"));
