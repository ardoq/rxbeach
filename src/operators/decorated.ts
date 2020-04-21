import { Observable, SchedulerLike } from 'rxjs';
import * as operators from 'rxjs/operators';
import {
  markMerge,
  markCombineLatest,
  markWithLatestFrom,
  findMarker,
  MarkedObservable,
  markDebounceTime,
} from '../internal/markers';

export const merge = ((...sources: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.merge(...sources),
    markMerge([observable$, ...sources])
  )) as typeof operators.merge;

export const withLatestFrom = ((...dependencies: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.withLatestFrom(...dependencies),
    markWithLatestFrom(observable$, dependencies)
  )) as typeof operators.withLatestFrom;

export const combineLatest = ((...sources: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.combineLatest(...sources),
    markCombineLatest([observable$, ...sources])
  )) as typeof operators.combineLatest;

export const startWith = ((...args: any) => (
  observable$: Observable<unknown>
) => {
  const startWith$ = observable$.pipe(operators.startWith(...args));
  const marker = findMarker(observable$);
  if (marker === null) return startWith$;
  return new MarkedObservable(startWith$, marker);
}) as typeof operators.startWith;

export const debounceTime: typeof operators.debounceTime = (
  dueTime: number,
  scheduler?: SchedulerLike
) => <T>(observable$: Observable<T>) =>
  observable$.pipe(
    operators.debounceTime(dueTime, scheduler),
    markDebounceTime(observable$, dueTime)
  );
