import sinon from 'sinon';
import { rethrowErrorGlobally } from '../internal/rethrowErrorGlobally';

const test = untypedTest as TestFn<{ clock: sinon.SinonFakeTimers }>;

test.before((t) => {
  t.context.clock = sinon.useFakeTimers();
});
test.beforeEach((t) => t.context.clock.reset());
test.after((t) => t.context.clock.restore());

test('rethrows error globally', (t) => {
  const error = new Error('Hello errors!');

  rethrowErrorGlobally(error);

  expect(() => t.context.clock.tick(1)).toThrowError({ is: error });
});
