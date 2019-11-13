import { Action } from 'rxbeach';
import { VoidPayload } from 'rxbeach/internal';
import * as internals from 'rxbeach/internal';
import sinon, { SinonStub } from 'sinon';
import { TestInterface } from 'ava';

export const mockAction = <P = VoidPayload>(
  type: string,
  namespace?: string,
  payload?: P
): Action<P> =>
  ({
    meta: { namespace },
    type,
    payload,
  } as Action<P>);

export type TestContextRethrowErrorGlobally = {
  rethrowErrorGlobally: SinonStub<[any], number>;
};

export const stubRethrowErrorGlobally = (untypedTest: TestInterface) => {
  const test = untypedTest as TestInterface<TestContextRethrowErrorGlobally>;
  test.before(t => {
    t.context.rethrowErrorGlobally = sinon.stub(
      internals,
      'rethrowErrorGlobally'
    );
  });
  test.after(t => t.context.rethrowErrorGlobally.restore());
  test.beforeEach(t => t.context.rethrowErrorGlobally.reset());

  return test;
};
