import { equal, deepEqual } from 'assert';
import { of, OperatorFunction } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { ActionWithPayload, ActionWithoutPayload } from 'rxbeach';
import { extractPayload, ofType } from 'rxbeach/operators';
import { mockAction } from 'rxbeach/internal';
import { withNamespace } from './operators';

const pipeActionWithPayload = <P, R>(
  payload: P,
  pipe: OperatorFunction<ActionWithPayload<P>, R>
): Promise<R> =>
  of(mockAction('', '', payload) as ActionWithPayload<P>)
    .pipe(pipe)
    .toPromise();

describe('operators', function() {
  describe('extractPayload', function() {
    const tests = [
      ['primitive', 'Hello World'],
      ['array', ['Hello', { what: 'World' }]],
      ['object', { foo: true }],
    ];

    for (const [name, payload] of tests) {
      it(`Should extract ${name} payload`, async function() {
        const res = await pipeActionWithPayload(payload, extractPayload());

        equal(res, payload);
      });
    }
  });

  describe('ofType', function() {
    it('Should filter one action type', async function() {
      const targetType = 'Correct type';
      const otherType = 'Wrong type';

      const res = await of<ActionWithoutPayload>(
        mockAction(targetType),
        mockAction(otherType),
        mockAction(targetType)
      )
        .pipe(ofType(targetType))
        .toPromise();

      equal(res.type, targetType);
    });

    it('Should filter multiple action types', async function() {
      const targetType1 = 'Correct type one';
      const targetType2 = 'Correct type two';
      const otherType = 'Wrong type';

      const collectedTypes = await of<ActionWithoutPayload>(
        mockAction(targetType1),
        mockAction(otherType),
        mockAction(targetType2)
      )
        .pipe(
          ofType(targetType1, targetType2),
          reduce((acc, { type }) => [...acc, type], [] as string[])
        )
        .toPromise();

      deepEqual(collectedTypes, [targetType1, targetType2]);
    });
  });

  describe('withNamespace', function() {
    it('Should filter actions by namespace', async function() {
      const actionType = 'actionType';
      const namespace = 'namespace';

      const res = await of<ActionWithoutPayload>(
        mockAction(actionType),
        mockAction(actionType, namespace),
        mockAction(actionType)
      )
        .pipe(withNamespace(namespace))
        .toPromise();

      deepEqual(res, mockAction(actionType, namespace));
    });
  });
});
