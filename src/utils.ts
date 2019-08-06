import { Observable, OperatorFunction } from "rxjs";
import { ActionWithPayload } from "types";
import { map } from "rxjs/operators";

export const subscribeAndGuard = (stream$: Observable<unknown>) =>
  stream$.subscribe(
    () => null,
    (error: Error) => {
      console.error("UNHANDLED ERROR IN STREAM", error);

      // TODO is this needed? Inherited from ardoq subscribeAndGuard
      subscribeAndGuard(stream$);
    }
  );

export const extractPayload = <Payload>(): OperatorFunction<
  ActionWithPayload<Payload>,
  Payload
> => map(action => action.payload);
