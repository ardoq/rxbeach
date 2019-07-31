import { Action, ActionDispatcher, ActionStream } from "types";
import { filter, map } from "rxjs/operators";
import { MonoTypeOperatorFunction } from "rxjs";

export const getQualifier = () => Symbol();

const filterQualifier = (
  qualifier: symbol
): MonoTypeOperatorFunction<Action<any>> =>
  filter(
    ({
      meta: {
        qualifiers: [actionQualifier]
      }
    }) => actionQualifier === qualifier
  );

const stripQualifier = (): MonoTypeOperatorFunction<Action<any>> =>
  map(({ meta: { qualifiers: [, ...qualifiers], ...meta }, ...action }) => ({
    ...action,
    meta: { ...meta, qualifiers }
  }));

export const createChildDispatcher = (
  parentDispatcher: ActionDispatcher,
  qualifier: symbol
): ActionDispatcher => action =>
  parentDispatcher({
    type: action.type,
    payload: action.payload,
    meta: {
      ...action.meta,
      qualifiers: [qualifier, ...action.meta.qualifiers]
    }
  });

export const createChildActionStream = (
  action$: ActionStream,
  qualifier: symbol
): ActionStream =>
  action$.pipe(
    filterQualifier(qualifier),
    stripQualifier()
  );
