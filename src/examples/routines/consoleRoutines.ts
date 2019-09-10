import { pipe } from "rxjs";
import { tap, map } from "rxjs/operators";
import { action$, dispatchAction } from "examples/globalActions";
import {
  combineActionOperators,
  registerActionOperators
} from "lib/actionOperators";
import { actionRoutine } from "lib/routines/actionRoutine";
import { hookRoutine } from "lib/routines/hookRoutine";
import { extractPayload } from "lib/utils/operators";

export const messages: string[] = [];

// Shim for console log, so we can verify what is logged
const consoleLog = (msg: string) => messages.push(msg);

export const logToConsole = actionRoutine<string>(
  "[debug] log to console",
  pipe(
    extractPayload(),
    tap(message => consoleLog(message))
  )
);

const logMessageLength = actionRoutine<number>(
  "[debug] log message length",
  pipe(
    extractPayload(),
    tap(length => consoleLog("Message length: " + length))
  )
);

const logMessageLengthHook = hookRoutine(
  pipe(
    extractPayload(),
    map(message => logMessageLength(message.length)),
    tap(dispatchAction)
  ),
  logToConsole
);

const routines = combineActionOperators(
  logToConsole,
  logMessageLength,
  logMessageLengthHook
);

// In a setup function
registerActionOperators(action$, routines);

// When the action logToConsole("Hello World!") is dispatched, the console would
// print:
// > Hello World!
// > Message length: 12
