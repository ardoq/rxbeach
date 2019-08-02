import { routine, RoutineSet } from "../src/routines";
import { tap } from "rxjs/operators";
import { pipe } from "rxjs";
import { extractPayload } from "utils";

export const pingPong = routine<{ ping: boolean }>(dispatchAction =>
  pipe(
    extractPayload(),
    tap(payload => {
      if (payload.ping === false) {
        // PING
        dispatchAction(pingPong({ ping: true }));
      } else {
        // PONG
        dispatchAction(pingPong({ ping: false }));
      }
    })
  )
);

export const routines: RoutineSet = new Set([pingPong.routine]);
