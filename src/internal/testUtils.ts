import { ActionWithPayload, ActionWithoutPayload } from 'types/Action';

export const actionWithoutPayload = (
  type: string,
  qualifier?: symbol
): ActionWithoutPayload => ({
  meta: { qualifier },
  type,
});

export const actionWithPayload = <P>(
  type: string,
  payload: P,
  qualifier?: symbol
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifier),
  payload,
});
