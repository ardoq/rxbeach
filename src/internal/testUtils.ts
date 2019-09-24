import { ActionWithPayload, ActionWithoutPayload } from 'types/Action';

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

export const beforeEach = <T>(
  suite: Mocha.Suite,
  setup: () => T
): ((context: Mocha.Context) => T) => {
  suite.beforeEach(function() {
    this.scaffolding = setup();
  });

  return context => context.scaffolding as T;
};
