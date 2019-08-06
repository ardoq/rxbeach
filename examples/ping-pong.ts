import { reducer, ReducerMap } from "reducer";
import { action$ } from "./globalActions";
import { reduceToStateStream } from "stateStream";
import { routine, RoutineSet } from "routines/routines";
import { tap, map, flatMap, combineLatest, filter } from "rxjs/operators";
import { pipe } from "rxjs";
import { extractPayload } from "utils";
import { epic, EpicSet } from "routines/epics";
import { ActionWithoutPayload } from "types";
import { saga, SagaSet } from "routines/sagas";

/*
 * A simple stream example: PING -- PONG
 */

enum PingPongState {
  PING,
  PONG
}

type PingOrPong = {
  pingOrPong: PingPongState;
};

//// Stream ////
// The action-reducers
const ping = reducer<PingPongState>(() => PingPongState.PING);
const pong = reducer<PingPongState>(() => PingPongState.PING);

const reducers: ReducerMap<PingPongState> = new Map([
  ping.reducer,
  pong.reducer
]);

/**
 * The pingPongState$ holds the last ping or pong type
 */
const pingPongState$ = action$.pipe(
  reduceToStateStream("pingPongState$", reducers, PingPongState.PING)
);

//// Pure routines ////
const logPingPong = routine<PingOrPong>(
  "Log ping or pong",
  pipe(
    extractPayload(),
    tap(({ pingOrPong }) => {
      if (pingOrPong === PingPongState.PING) {
        console.log("PING");
      } else if (pingOrPong === PingPongState.PONG) {
        console.log("PONG!");
      }
    })
  )
);

// shim for window.alert
const alert = (msg: string) => null;

const alertInvalidPingPong = routine<PingOrPong>(
  "Alert the user of invalid ping pong state",
  pipe(
    extractPayload(),
    tap(({ pingOrPong }) => alert(`Invalid ping or pong: ${pingOrPong}`))
  )
);

const routines: RoutineSet = new Set([logPingPong]);

//// Multiplexing routines ////
// Utils
const filterPingPongActions = () =>
  filter(
    ({ type }: ActionWithoutPayload) => type === ping.type || type === pong.type
  );
const actionToPingOrPong = (action: ActionWithoutPayload): PingOrPong => {
  if (action.type === ping.type) {
    return { pingOrPong: PingPongState.PING };
  } else if (action.type === pong.type) {
    return { pingOrPong: PingPongState.PONG };
  } else {
    throw new Error("Unknown action");
  }
};

const logWhenPingPong = epic(
  pipe(
    filterPingPongActions(),
    map(action => logPingPong(actionToPingOrPong(action)))
  ),
  ping,
  pong
);

const verifyWhenPingPong = epic(
  pipe(
    filterPingPongActions(),
    map(action => verifyPingAndPongAlternating(actionToPingOrPong(action)))
  ),
  ping,
  pong
);

const epics: EpicSet = new Set([logWhenPingPong, verifyWhenPingPong]);

//// Data routine ////
const verifyPingAndPongAlternating = saga<PingOrPong>(
  "verify next ping pong state is valid",
  pipe(
    extractPayload(),
    combineLatest(pingPongState$),
    flatMap(([{ pingOrPong: latest }, previous]) => {
      if (latest === previous) {
        return [alertInvalidPingPong({ pingOrPong: latest })];
      }
      return [];
    })
  )
);

const sagas: SagaSet = new Set([verifyPingAndPongAlternating]);
