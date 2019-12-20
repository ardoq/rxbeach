import { Observable, OperatorFunction } from 'rxjs';

export type CombinationOperator = {
  <T, A>(name: string, a: Observable<A>): OperatorFunction<T, [T, A]>;
  <T, A, B>(name: string, a: Observable<A>, b: Observable<B>): OperatorFunction<
    T,
    [T, A, B]
  >;
  <T, A, B, C>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>
  ): OperatorFunction<T, [T, A, B, C]>;
  <T, A, B, C, D>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>
  ): OperatorFunction<T, [T, A, B, C, D]>;
  <T, A, B, C, D, E>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>
  ): OperatorFunction<T, [T, A, B, C, D, E]>;
  <T, A, B, C, D, E, F>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>
  ): OperatorFunction<T, [T, A, B, C, D, E, F]>;
  <T, A, B, C, D, E, F, G>(
    name: string,
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>,
    g: Observable<G>
  ): OperatorFunction<T, [T, A, B, C, D, E, F, G]>;
  <T>(name: string, ...dependencies: Observable<unknown>[]): OperatorFunction<
    T,
    unknown
  >;
};
