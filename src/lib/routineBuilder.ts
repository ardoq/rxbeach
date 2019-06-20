import ActionCreator, { ActionCreatorWithPayload } from "./ActionCreator";
import { OperatorFunction, pipe } from "rxjs";
import { Action$ } from "action$";
import { ofType, extractPayload } from "./stream-operators";
import { AnyActionAuto, AnyActionMaybePayload, PossiblyArray } from "./types";

interface OfType {
  <Type extends string, Payload>(
    actionCreator: PossiblyArray<ActionCreator<Type, Payload>>,
    pipe: OperatorFunction<AnyActionAuto<Payload>, any>
  ): RoutineBuilder;

  // TODO - can Payload be inferred to a union type here?
  <Payload = any>(
    actionCreators: ActionCreator<any, Payload>[],
    pipe: OperatorFunction<AnyActionAuto<Payload>, any>
  ): RoutineBuilder;
}

interface UsesPayload {
  <Type extends string, Payload>(
    actionCreator: ActionCreatorWithPayload<Type, Payload>,
    pipe: OperatorFunction<Payload, any>
  ): RoutineBuilder;

  <Payload>(
    actionCreators: ActionCreatorWithPayload<any, Payload>[],
    pipe: OperatorFunction<Payload, any>
  ): RoutineBuilder;

  // TODO - can Payload be inferred to a union type here?
  <Payload = any>(
    actionCreators: ActionCreatorWithPayload<any, Payload>[],
    pipe: OperatorFunction<Payload, any>
  ): RoutineBuilder;
}

export interface RoutineBuilder {
  _routines: OperatorFunction<AnyActionMaybePayload, any>[];

  /**
   * Register a routine that should receive all actions - of any type
   */
  any: (pipe: OperatorFunction<AnyActionMaybePayload, any>) => RoutineBuilder;

  /**
   * Register a routine that should receive actions from a specific action
   * creator, or a list of action creators
   */
  ofType: OfType;

  /**
   * Register a routine that should receive payloads from a specific action
   * creator or a list of action creators
   */
  usesPayload: UsesPayload;

  /**
   * Subscribe all registered routines to this action stream
   */
  start: (action$: Action$) => void;
}

export const subscribeAndGuard = (stream: Action$) => {
  stream.subscribe(
    () => null,
    (error: Error) => {
      console.error("UNHANDLED ERROR IN ACTION$ ROUTINE", error);

      // TODO is this needed? Inherited from ardoq subscribeAndGuard
      subscribeAndGuard(stream);
    }
  );
};

const routineBuilder = () => {
  const builder: RoutineBuilder = {
    _routines: [],

    any: pipe => {
      builder._routines.push(pipe);
      return builder;
    },

    ofType: <Payload>(
      actionCreator: PossiblyArray<ActionCreator<any, Payload>>,
      local: OperatorFunction<AnyActionMaybePayload, AnyActionAuto<Payload>>
    ) =>
      builder.any(
        pipe(
          ofType(actionCreator),
          local
        )
      ),

    // TODO typings?
    usesPayload: (actionCreator: any, local: OperatorFunction<any, any>) =>
      builder.ofType(
        actionCreator as any,
        pipe(
          extractPayload(),
          local
        )
      ),

    start: action$ =>
      builder._routines.forEach(local => subscribeAndGuard(action$.pipe(local)))
  };

  return builder;
};

export default routineBuilder;
