import { epic, EpicSet } from "../src/routines/epics";
import { pipe } from "rxjs";
import { logPingPong } from "./2-routines";
import { extractPayload } from "utils";
import { filter, map } from "rxjs/operators";

type P = ReturnType<typeof logPingPong>["payload"];

export const dispatchPongForPing = epic(
  pipe(
    extractPayload(),
    filter(({ ping }) => ping),
    map(() => logPingPong({ ping: false }))
  ),
  logPingPong
);

export const epics: EpicSet = new Set([dispatchPongForPing]);
