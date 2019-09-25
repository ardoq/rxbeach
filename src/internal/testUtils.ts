import { ActionWithPayload, ActionWithoutPayload } from 'types/Action';

export const actionWithoutPayload = (
  type: string,
  namespace?: string
): ActionWithoutPayload => ({
  meta: { namespace },
  type,
});

export const actionWithPayload = <P>(
  type: string,
  payload: P,
  namespace?: string
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, namespace),
  payload,
});
