import { Observable, OperatorFunction, MonoTypeOperatorFunction } from "rxjs";
import { ActionWithPayload, AnyAction } from "types";
import { map, filter } from "rxjs/operators";

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

export const ofType = (
  targetType: symbol
): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => type === targetType);

export const ofTypes = (types: symbol[]): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => types.indexOf(type) !== -1);
