import { Observable, SchedulerLike } from 'rxjs';
import * as operators from 'rxjs/operators';
import {
  MarkedObservable,
  findMarker,
  markCombineLatest,
  markDebounceTime,
  markMerge,
  markWithLatestFrom,
} from '../internal/markers';

export const mergeWith = ((...sources: Observable<unknown>[]) =>
  (observable$: Observable<unknown>) =>
    observable$.pipe(
      operators.mergeWith(...sources),
      markMerge([observable$, ...sources])
    )) as typeof operators.mergeWith;

export const withLatestFrom = ((...dependencies: Observable<unknown>[]) =>
  (observable$: Observable<unknown>) =>
    observable$.pipe(
      operators.withLatestFrom(...dependencies),
      markWithLatestFrom(observable$, dependencies)
    )) as typeof operators.withLatestFrom;

export const combineLatestWith = ((
    source: Observable<unknown>,
    ...sources: Observable<unknown>[]
  ) =>
  (observable$: Observable<unknown>) =>
    observable$.pipe(
      operators.combineLatestWith(source, ...sources),
      markCombineLatest([observable$, source, ...sources])
    )) as typeof operators.combineLatestWith;

export const startWith = ((...args: any) =>
  (observable$: Observable<unknown>) => {
    const startWith$ = observable$.pipe(operators.startWith(...args));
    const marker = findMarker(observable$);
    if (marker === null) return startWith$;
    return new MarkedObservable(startWith$, marker);
    // only one of the overloads is deprecated
    // tslint:disable-next-line deprecation
  }) as typeof operators.startWith;

export const debounceTime: typeof operators.debounceTime =
  (dueTime: number, scheduler?: SchedulerLike) =>
  <T>(observable$: Observable<T>) =>
    observable$.pipe(
      operators.debounceTime(dueTime, scheduler),
      markDebounceTime(observable$, dueTime)
    );
