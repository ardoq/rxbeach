import { marbles } from 'rxjs-marbles/mocha';
import {
  ActionWithPayload,
  actionCreator,
  namespaceActionCreator,
} from 'rxbeach';
import {
  extractPayload,
  withNamespace,
  ofType,
  ofTypes,
} from 'rxbeach/operators';
import { mockAction } from 'rxbeach/internal';

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

  describe('ofTypes', function() {
    const targetType1 = 'Correct type one';
    const targetType2 = 'Correct type two';
    const otherType = 'Wrong type';
    const inputsOutputs = {
      a: mockAction(targetType1),
      b: mockAction(targetType2),
      c: mockAction(otherType),
    };

    it(
      'Should filter one action type',
      marbles(m => {
        const source = m.hot('aca', inputsOutputs);
        const expected = m.hot('a-a', inputsOutputs);

        m.expect(source.pipe(ofTypes(targetType1))).toBeObservable(expected);
      })
    );

    it(
      'Should filter multiple action types',
      marbles(m => {
        const source = m.hot('acb', inputsOutputs);
        const expected = m.hot('a-b', inputsOutputs);

        const collectedTypes = source.pipe(ofTypes(targetType1, targetType2));

        m.expect(collectedTypes).toBeObservable(expected);
      })
    );
  });

  describe('ofType', function() {
    const voidAction = actionCreator('void action');
    const payloadAction = actionCreator<number>('payload action');
    const actions = {
      v: voidAction(),
      p: payloadAction(1),
    };

    it(
      'Should filter void action types',
      marbles(m => {
        const source = m.hot('pvp', actions);
        const expected = m.hot('-v-', actions);

        m.expect(source.pipe(ofType(voidAction))).toBeObservable(expected);
      })
    );

    it(
      'Should filter payload action types',
      marbles(m => {
        const source = m.hot('vpv', actions);
        const expected = m.hot('-p-', { p: actions.p });

        m.expect(source.pipe(ofType(payloadAction))).toBeObservable(expected);
      })
    );
  });

  describe('withNamespace', function() {
    const actionType = 'actionType';
    const namespace = 'namespace';

    it(
      'Should filter actions by namespace',
      marbles(m => {
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

  describe('INTEGRATION', function() {
    const voidAction = actionCreator('void action');
    const payloadAction = actionCreator<number>('payload action');
    const voidActionNS = namespaceActionCreator('NS', voidAction);
    const payloadActionNS = namespaceActionCreator('NS', payloadAction);

    const payloads = {
      p: 2,
      q: 3,
    };
    const actions = {
      v: voidAction(),
      w: voidActionNS(),
      p: payloadAction(payloads.p),
      q: payloadActionNS(payloads.q),
    };

    it(
      'Should be possible to chain withNamespace, ofType and extractPayload',
      marbles(m => {
        const source = m.hot('  pvwqwvp', actions);
        const expected = m.hot('---q---', payloads);

        m.expect(
          source.pipe(
            withNamespace('NS'),
            ofType(payloadAction),
            extractPayload()
          )
        ).toBeObservable(expected);
      })
    );
  });
});
