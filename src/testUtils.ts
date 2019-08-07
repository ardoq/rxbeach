import { ActionWithPayload, ActionWithoutPayload } from "types";

export const actionWithoutPayload = (
  type: symbol,
  qualifiers: symbol[] = []
): ActionWithoutPayload => ({
  meta: { qualifiers },
  type
});

export const actionWithPayload = <P>(
  type: symbol,
  payload: P,
  qualifiers: symbol[] = []
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type, qualifiers),
  payload
});
