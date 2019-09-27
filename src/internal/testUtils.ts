import { Action } from 'rxbeach';
import { VoidPayload } from 'rxbeach/internal';

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
