import {
  ActionWithPayload,
  ActionWithoutPayload,
} from 'stream-patterns/types/Action';

export const actionWithoutPayload = (
  type: symbol,
  qualifiers: symbol[] = []
): ActionWithoutPayload => ({
  meta: { qualifiers },
  type,
});

export const actionWithPayload = <P>(
  type: symbol,
  payload: P,
  qualifiers: symbol[] = []
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifiers),
  payload,
});
