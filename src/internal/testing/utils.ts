import { Action } from '../../types/Action';
import { VoidPayload } from '../types';
import * as rethrowErrorGloballyModule from '../rethrowErrorGlobally';
import sinon, { SinonStub } from 'sinon';
import { TestFn } from 'ava';

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
  rethrowErrorGlobally: SinonStub<[any], NodeJS.Timeout>;
};

export const stubRethrowErrorGlobally = (untypedTest: TestFn) => {
  const test = untypedTest as TestFn<TestContextRethrowErrorGlobally>;
  test.before((t) => {
    t.context.rethrowErrorGlobally = sinon.stub(
      rethrowErrorGloballyModule,
      'rethrowErrorGlobally'
    );
  });
  test.after((t) => t.context.rethrowErrorGlobally.restore());
  test.beforeEach((t) => t.context.rethrowErrorGlobally.reset());

  return test;
};
