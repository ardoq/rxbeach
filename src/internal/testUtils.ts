import { ActionWithPayload, ActionWithoutPayload } from 'types/Action';

export const actionWithoutPayload = (
  type: string,
  namespace?: symbol
): ActionWithoutPayload => ({
  meta: { namespace },
  type,
});

export const actionWithPayload = <P>(
  type: string,
  payload: P,
  namespace?: symbol
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, namespace),
  payload,
});
