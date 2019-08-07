import { ActionWithPayload, ActionWithoutPayload } from "types";

export const actionWithoutPayload = (type: symbol): ActionWithoutPayload => ({
  meta: { qualifiers: [] },
  type
});

export const actionWithPayload = <P>(
  type: symbol,
  payload: P
): ActionWithPayload<P> => ({
  ...actionWithoutPayload(type),
  payload
});
