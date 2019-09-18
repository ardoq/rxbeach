import { equal, deepEqual } from 'assert';
import { of, OperatorFunction } from 'rxjs';
import { tap, reduce } from 'rxjs/operators';
import {
  actionWithPayload,
  actionWithoutPayload,
} from 'stream-patterns/testUtils';
import {
  ActionWithPayload,
  ActionWithoutPayload,
} from 'stream-patterns/types/Action';
import { extractPayload, ofType, ofTypes } from './operators';

const pipeActionWithPayload = <P, R>(
  payload: P,
  pipe: OperatorFunction<ActionWithPayload<P>, R>
): Promise<R> =>
  of(actionWithPayload('', payload))
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

      await of<ActionWithoutPayload>(
        actionWithoutPayload(targetType),
        actionWithoutPayload(otherType),
        actionWithoutPayload(targetType)
      )
        .pipe(
          ofType(targetType),
          tap(action => equal(action.type, targetType))
        )
        .toPromise();
    });
  });

  describe('ofTypes', function() {
    it('Should filter multiple action types', async function() {
      const targetType1 = 'Correct type one';
      const targetType2 = 'Correct type two';
      const otherType = 'Wrong type';

      const collectedTypes = await of<ActionWithoutPayload>(
        actionWithoutPayload(targetType1),
        actionWithoutPayload(otherType),
        actionWithoutPayload(targetType2)
      )
        .pipe(
          ofTypes(new Set([targetType1, targetType2])),
          reduce((acc, { type }) => [...acc, type], [] as string[])
        )
        .toPromise();

      deepEqual(collectedTypes, [targetType1, targetType2]);
    });
  });
});
