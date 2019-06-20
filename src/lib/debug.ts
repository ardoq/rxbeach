import { ActionMeta } from "./types";

export class Debug {
  debug = false;

  setDebug(debug: boolean) {
    this.debug = debug;
  }

  isDebug() {
    return this.debug;
  }

  createMeta(): ActionMeta | undefined {
    if (!this.debug) return undefined;
    return {
      callStack: new Error(),
      createdAt: new Date()
    };
  }
}

const debug = new Debug();

export default debug;
