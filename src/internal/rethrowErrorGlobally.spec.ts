import untypedTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { rethrowErrorGlobally } from 'rxbeach/internal';

const test = untypedTest as TestInterface<{ clock: sinon.SinonFakeTimers }>;

test.before(t => {
  t.context.clock = sinon.useFakeTimers();
});
test.beforeEach(t => t.context.clock.reset());
test.after(t => t.context.clock.restore());

test('rethrows error globally', t => {
  const message = 'Hello errors!';

  rethrowErrorGlobally(new Error(message));

  t.throws(() => t.context.clock.tick(1), Error, message);
});
