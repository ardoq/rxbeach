import { deepEqual } from "assert";
import { dispatchAction } from "../globalActions";
import { logToConsole, messages } from "./consoleRoutines";

describe("examples", function() {
  it("consoleRoutines", async function() {
    dispatchAction(logToConsole("Hello World!"));

    deepEqual(messages, ["Hello World!", "Message length: 12"]);
  });
});
