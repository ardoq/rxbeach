import { Observable, ObservableInput } from 'rxjs';
import { combineLatest } from './decoratedObservableCombiners';
import { markName } from './internal/markers';

export type DerivedStream = {
  <A>(name: string, a: ObservableInput<A>): Observable<[A]>;
  <A, B>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>
  ): Observable<[A, B]>;
  <A, B, C>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>
  ): Observable<[A, B, C]>;
  <A, B, C, D>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>
  ): Observable<[A, B, C, D]>;
  <A, B, C, D, E>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>
  ): Observable<[A, B, C, D, E]>;
  <A, B, C, D, E, F>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>,
    f: ObservableInput<F>
  ): Observable<[A, B, C, D, E, F]>;
  <A, B, C, D, E, F, G>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>,
    f: ObservableInput<F>,
    g: ObservableInput<G>
  ): Observable<[A, B, C, D, E, F, G]>;
  <A, B, C, D, E, F, G, H>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>,
    f: ObservableInput<F>,
    g: ObservableInput<G>,
    h: ObservableInput<H>
  ): Observable<[A, B, C, D, E, F, G, H]>;
  <A, B, C, D, E, F, G, H, I>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>,
    f: ObservableInput<F>,
    g: ObservableInput<G>,
    h: ObservableInput<H>,
    i: ObservableInput<I>
  ): Observable<[A, B, C, D, E, F, G, H, I]>;
  <A, B, C, D, E, F, G, H, I, J>(
    name: string,
    a: ObservableInput<A>,
    b: ObservableInput<B>,
    c: ObservableInput<C>,
    d: ObservableInput<D>,
    e: ObservableInput<E>,
    f: ObservableInput<F>,
    g: ObservableInput<G>,
    h: ObservableInput<H>,
    i: ObservableInput<I>,
    j: ObservableInput<J>
  ): Observable<[A, B, C, D, E, F, G, H, I, J]>;
  (
    name: string,
    ...dependencies: ObservableInput<unknown>[]
  ): Observable<unknown>;
};

/**
 * Make this stream a derived stream of its source and dependencies
 *
 * This is basically an annotated version of the `combineLatest` operator that
 * adds markers so the stream can be analyzed.
 *
 * @param name The unique name of this stream
 * @param dependencies The dependencies of this stream
 * @see combineLatest
 */
export const derivedStream: DerivedStream = (
  name: string,
  ...dependencies: ObservableInput<unknown>[]
): Observable<any> => combineLatest(...dependencies).pipe(markName(name));
