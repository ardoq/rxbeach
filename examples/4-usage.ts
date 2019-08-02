import { subscribeAndGuard } from "../src/utils";
import { basicState$, action$ } from "./3-stream";
import { subscribeRoutines } from "../src/routines";
import { routines, pingPong } from "./2-routines";
import { ActionDispatcher } from "types";
import { appendRelevantData } from "./1-reducers";

const dispatchAction: ActionDispatcher = action => action$.next(action);

subscribeAndGuard(basicState$);
subscribeRoutines(action$, dispatchAction, routines);

dispatchAction(appendRelevantData({ data: ["magic", "no!"], relevant: true }));
dispatchAction(pingPong({ ping: false }));
