import untypedTest from 'ava';
import {
  defaultErrorSubject,
  stubRethrowErrorGlobally,
} from 'rxbeach/internal';

const test = stubRethrowErrorGlobally(untypedTest);

test('defaultErrorSubject rethrows errors globally', t => {
  const error = new Error('Hello errors');
  defaultErrorSubject.next(error);

  t.context.rethrowErrorGlobally.calledOnceWithExactly(error);
  t.pass();
});
