import { Subject } from "rxjs";

export type Action<Payload = void> = Payload extends void
  ? { type: symbol }
  : { type: symbol; payload: Payload };

export type ActionStream = Subject<Action<any>>;
