import { marbles } from 'rxjs-marbles/mocha';
import { ActionWithPayload, ActionWithoutPayload } from 'rxbeach';
import { extractPayload, ofType } from 'rxbeach/operators';
import { mockAction } from 'rxbeach/internal';
import { withNamespace } from './operators';

describe('operators', function() {
  describe('extractPayload', function() {
    const tests = [
      ['primitive', 'Hello World'],
      ['array', ['Hello', { what: 'World' }]],
      ['object', { foo: true }],
    ];

    for (const [name, payload] of tests) {
      it(
        `Should extract ${name} payload`,
        marbles(m => {
          const inputs = {
            a: mockAction('', '', payload),
          };
          const outputs = {
            p: payload,
          };

          const source = m.hot<ActionWithPayload<any>>('aa', inputs);
          const expected = m.hot('pp', outputs);

          m.expect(source.pipe(extractPayload())).toBeObservable(expected);
        })
      );
    }
  });

  describe('ofType', function() {
    it(
      'Should filter one action type',
      marbles(m => {
        const targetType = 'Correct type';
        const otherType = 'Wrong type';

        const inputsOutputs = {
          a: mockAction(targetType),
          b: mockAction(otherType),
        };

        const source = m.hot('aba', inputsOutputs);
        const expected = m.hot('a-a', inputsOutputs);

        m.expect(source.pipe(ofType(targetType))).toBeObservable(expected);
      })
    );

    it(
      'Should filter multiple action types',
      marbles(m => {
        const targetType1 = 'Correct type one';
        const targetType2 = 'Correct type two';
        const otherType = 'Wrong type';

        const inputsOutputs = {
          a: mockAction(targetType1),
          b: mockAction(targetType2),
          c: mockAction(otherType),
        };

        const source = m.hot('acb', inputsOutputs);
        const expected = m.hot('a-b', inputsOutputs);

        const collectedTypes = source.pipe(ofType(targetType1, targetType2));

        m.expect(collectedTypes).toBeObservable(expected);
      })
    );
  });

  describe('withNamespace', function() {
    it(
      'Should filter actions by namespace',
      marbles(m => {
        const actionType = 'actionType';
        const namespace = 'namespace';

        const inputsOutputs = {
          a: mockAction(actionType),
          b: mockAction(actionType, namespace),
        };

        const source = m.hot('aba', inputsOutputs);
        const expected = m.hot('-b-', inputsOutputs);

        m.expect(source.pipe(withNamespace(namespace))).toBeObservable(
          expected
        );
      })
    );
  });
});
