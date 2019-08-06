import { subscribeAndGuard } from "../src/utils";
import { basicState$Factory } from "./3-stream";
import { subscribeRoutines } from "../src/routines";
import { routines, pingPong } from "./2-routines";
import { ActionDispatcher, ActionStream } from "types";
import { appendRelevantData } from "./1-reducers";

const initScope = (
  parentAction$: ActionStream,
  parentDispatchAction: ActionDispatcher
) => {
  const { action$, dispatchAction, state$: basicState$ } = basicState$Factory(
    parentAction$,
    parentDispatchAction
  );
  // The state doesn't yet exist, as there are no subscriptions to the basicState$
  // Any action dispatched at this point would be discarded

  subscribeAndGuard(basicState$);
  subscribeRoutines(action$, dispatchAction, routines);

  dispatchAction(
    appendRelevantData({ data: ["magic", "no!"], relevant: true })
  );
  dispatchAction(pingPong({ ping: false }));
};
