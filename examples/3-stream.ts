import { Action } from "../src/types";
import { reduceToStateStream } from "../src/stateStream";
import { Subject } from "rxjs";
import { BasicStateShape, reducers } from "./1-reducers";

export const action$ = new Subject<Action<any>>();

const INITIAL_STATE: BasicStateShape = {
  data: []
};

export const basicState$ = action$.pipe(
  reduceToStateStream("basic$", reducers, INITIAL_STATE)
);
