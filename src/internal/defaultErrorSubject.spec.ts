import untypedTest from 'ava';
import { defaultErrorSubject } from 'rxbeach/internal';
import { stubRethrowErrorGlobally } from 'rxbeach/internal/testing/utils';

const test = stubRethrowErrorGlobally(untypedTest);

test('defaultErrorSubject rethrows errors globally', t => {
  const error = new Error('Hello errors');
  defaultErrorSubject.next(error);

  t.context.rethrowErrorGlobally.calledOnceWithExactly(error);
  t.pass();
});
