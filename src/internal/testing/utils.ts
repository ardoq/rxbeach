import { Action } from '../../types/Action';
import { VoidPayload } from '../types';

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
