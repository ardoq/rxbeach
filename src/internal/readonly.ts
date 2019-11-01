export type Protected<T> = T extends Function
  ? T
  : T extends object
  ? {
      readonly [P in keyof T]: Protected<T[P]>;
    }
  : T;

export const protect = <T>(original: T): Protected<T> => {
  // typeof null is 'object', so we need to check for null
  if (typeof original !== 'object' || original === null) {
    return original as Protected<T>;
  }

  if (Array.isArray(original)) {
    const result: any = original.map(protect);
    Object.freeze(result);
    return result as Protected<T>;
  }

  const result: Partial<T> = {};
  for (const key in original) {
    const value = protect(original[key]);
    Object.defineProperty(result, key, {
      value,
      writable: false,
      enumerable: true,
    });
  }

  return result as Protected<T>;
};
