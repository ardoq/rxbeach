import { Observable } from 'rxjs';
import { combineLatest } from 'rxbeach';
import { markName } from 'rxbeach/internal';

export type DerivedStream = {
  <A>(name: string, a: Observable<A>): Observable<[A]>;
  <A, B>(name: string, a: Observable<A>, b: Observable<B>): Observable<[A, B]>;
  <A, B, C>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>
  ): Observable<[A, B, C]>;
  <A, B, C, D>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>
  ): Observable<[A, B, C, D]>;
  <A, B, C, D, E>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>
  ): Observable<[A, B, C, D, E]>;
  <A, B, C, D, E, F>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>
  ): Observable<[A, B, C, D, E, F]>;
  <A, B, C, D, E, F, G>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>,
    g: Observable<G>
  ): Observable<[A, B, C, D, E, F, G]>;
  (name: string, ...dependencies: Observable<unknown>[]): Observable<unknown>;
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
  ...dependencies: Observable<unknown>[]
): Observable<any> => combineLatest(...dependencies).pipe(markName(name));
