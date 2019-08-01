import { subscribeAndGuard } from "../src/utils";
import { basicState$, action$ } from "./3-stream";
import { subscribeRoutines } from "../src/routines";
import { routines } from "./2-routines";
import { ActionDispatcher } from "types";

const dispatchAction: ActionDispatcher = action => action$.next(action);

subscribeAndGuard(basicState$);
subscribeRoutines(action$, dispatchAction, routines);
