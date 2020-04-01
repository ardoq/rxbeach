import untypedTest from 'ava';
import { defaultErrorSubject } from './defaultErrorSubject';
import { stubRethrowErrorGlobally } from './testing/utils';

const test = stubRethrowErrorGlobally(untypedTest);

test('defaultErrorSubject rethrows errors globally', (t) => {
  const error = new Error('Hello errors');
  defaultErrorSubject.next(error);

  t.context.rethrowErrorGlobally.calledOnceWithExactly(error);
  t.pass();
});
