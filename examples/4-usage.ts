import { subscribeAndGuard } from "../src/utils";
import { basicState$Factory } from "./3-stream";
import { subscribeRoutines } from "../src/routines";
import { routines } from "./2-routines";
import { ActionDispatcher, ActionStream } from "../src/types";

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
};
