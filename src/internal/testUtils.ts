import { ActionWithPayload, ActionWithoutPayload } from 'types/Action';

export const actionWithoutPayload = (
  type: string,
  qualifiers: symbol[] = []
): ActionWithoutPayload => ({
  meta: { qualifiers },
  type,
});

export const actionWithPayload = <P>(
  type: string,
  payload: P,
  qualifiers: symbol[] = []
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifiers),
  payload,
});
