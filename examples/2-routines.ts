import { routine, RoutineSet } from "../src/routines";
import { tap } from "rxjs/operators";
import { pipe } from "rxjs";
import { extractPayload } from "utils";

export const logPingPong = routine<{ ping: boolean }>(dispatchAction =>
  pipe(
    extractPayload(),
    tap(payload => {
      if (payload.ping === false) {
        // PING
        console.log("pong");
      } else {
        // PONG
        console.log("ping");
      }
    })
  )
);

export const routines: RoutineSet = new Set([logPingPong]);
