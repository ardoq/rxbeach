export const beforeEach = <T>(
  suite: Mocha.Suite,
  setup: () => T
): ((context: Mocha.Context) => T) => {
  suite.beforeEach(function() {
    this.scaffolding = setup();
  });

  return context => context.scaffolding as T;
};
