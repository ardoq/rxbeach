import {
  ActionWithPayload,
  ActionWithoutPayload,
} from 'stream-patterns/types/Action';

export const actionWithoutPayload = (
  type: string,
  qualifiers: string[] = []
): ActionWithoutPayload => ({
  meta: { qualifiers },
  type,
});

export const actionWithPayload = <P>(
  type: string,
  payload: P,
  qualifiers: string[] = []
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifiers),
  payload,
});
