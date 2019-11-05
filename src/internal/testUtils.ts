import { Action } from 'rxbeach';
import { VoidPayload } from 'rxbeach/internal';
import { AssertionError } from 'assert';

export const mockAction = <P = VoidPayload>(
  type: string,
  namespace?: string,
  payload?: P
): Action<P> =>
  ({
    meta: { namespace },
    type,
    payload,
  } as Action<P>);

export const assertThrows = (ErrorConstructor: Function, func: () => void) => {
  try {
    func();
  } catch (err) {
    if (!(err instanceof ErrorConstructor)) {
      throw new AssertionError({
        message: 'Expected error to be thrown',
      });
    }
  }
};
