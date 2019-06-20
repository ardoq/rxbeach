import { Observable, OperatorFunction, pipe } from "rxjs";
import { filter, map, scan, startWith } from "rxjs/operators";
import { ReducerBuilder } from "./reducerBuilder";
import {
  PossiblyArray,
  AnyActionMaybePayload,
  ActionAuto,
  AnyActionWithPayload
} from "./types";
import ActionCreator from "./ActionCreator";

export const ofType = <Type extends string, Payload>(
  actionCreator: PossiblyArray<ActionCreator<Type, Payload>>
): OperatorFunction<
  Readonly<AnyActionMaybePayload>,
  Readonly<ActionAuto<Type, Payload>>
> => source => {
  const matcher =
    actionCreator instanceof Array
      ? (test: string) => actionCreator.some(({ type }) => test === type)
      : (test: string) => test === actionCreator.type;

  return source.pipe(
    filter(
      (action): action is ActionAuto<Type, Payload> => matcher(action.type)
    )
  );
};

// TODO - make sure extractPayload is not valid for void action streams
export const extractPayload = <Payload>(): OperatorFunction<
  Readonly<AnyActionWithPayload<Payload>>,
  Readonly<Payload>
> => source => source.pipe(map(({ payload }) => payload));

export const reduceActions = <State>(
  builder: ReducerBuilder<State>,
  seed: State
): OperatorFunction<AnyActionMaybePayload, State> =>
  pipe(
    filter(({ type }) => builder._reducers[type] !== undefined),
    scan((state: State, { type, payload }) => {
      const reducer = builder._reducers[type];
      return reducer(state, payload);
    }, seed)
  );

export const reduceActionsStartWithDefault = <State>(
  builder: ReducerBuilder<State>,
  seed: State
): OperatorFunction<AnyActionMaybePayload, State> =>
  pipe(
    reduceActions(builder, seed),
    startWith(seed)
  );

export const onFirstSubscription = <T>(onSubscribe: () => void) => (
  source: Observable<T>
) => {
  return new Observable<T>(observer => {
    const subscription = source.subscribe(observer);
    onSubscribe();
    return subscription;
  });
};
