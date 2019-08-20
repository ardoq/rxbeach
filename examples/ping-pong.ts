import { pipe } from "rxjs";
import { tap, map, flatMap, combineLatest, filter } from "rxjs/operators";
import { reducer, combineReducers } from "reducer";
import { epic } from "routines/epics";
import { routine } from "routines/routines";
import { saga } from "routines/sagas";
import { reduceToStateStream } from "stateStream";
import { ActionWithoutPayload, ActionConsumer } from "types";
import { extractPayload, combineActionOperators } from "utils";
import { action$ } from "./globalActions";

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
const pong = reducer<PingPongState>(() => PingPongState.PONG);

const reducers = combineReducers(PingPongState.PONG, ping, pong);

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

const actionOperators = combineActionOperators(
  logPingPong,
  logWhenPingPong,
  verifyWhenPingPong,
  verifyPingAndPongAlternating
);
