import test from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import {
  ActionWithPayload,
  actionCreator,
  namespaceActionCreator,
} from 'rxbeach';
import { extractPayload, withNamespace, ofType } from 'rxbeach/operators';
import { mockAction } from 'rxbeach/internal';
import { map } from 'rxjs/operators';

const tests = [
  ['primitive', 'Hello World'],
  ['array', ['Hello', { what: 'World' }]],
  ['object', { foo: true }],
];

for (const [name, payload] of tests) {
  test(
    `extractPayload should extract ${name} payload`,
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

const voidAction = actionCreator('void');
const fooAction = actionCreator<{ foo: number }>('foo');
const barAction = actionCreator<{ bar: number }>('bar');
const combinedAction = actionCreator<{ foo: number; bar: number }>('extended');

const v = voidAction();
const f = fooAction({ foo: 1 });
const b = barAction({ bar: 2 });
const c = combinedAction({ foo: 2, bar: 3 });

test(
  'ofType should filter one payload action type',
  marbles(m => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('-c-', { c: c.payload });

    m.expect(
      source.pipe(
        ofType(combinedAction),
        map(({ payload }) => payload)
      )
    ).toBeObservable(expected);
  })
);

test(
  'ofType should filter one void action type',
  marbles(m => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('--v', { v });

    m.expect(source.pipe(ofType(voidAction))).toBeObservable(expected);
  })
);

test(
  'ofType should filter multiple actions that are mix of void and not void',
  marbles(m => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('f-v', { f, v });

    m.expect(source.pipe(ofType(fooAction, voidAction))).toBeObservable(
      expected
    );
  })
);

test(
  'ofType should infer payload of multiple types that are overlapping',
  marbles(m => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('12-', {
      '1': 1,
      '2': 2,
    });

    m.expect(
      source.pipe(
        ofType(fooAction, combinedAction),
        map(({ payload: { foo } }) => foo)
      )
    ).toBeObservable(expected);
  })
);

test(
  'ofType should have payload field for multiple types that have non-overlapping payloads',
  marbles(m => {
    const source = m.hot('fb', { f, b });
    const expected = m.hot('fb', {
      f: f.payload,
      b: b.payload,
    });

    m.expect(
      source.pipe(
        ofType(fooAction, barAction),
        map(({ payload }) => payload)
      )
    ).toBeObservable(expected);
  })
);

test(
  'withNamespace should filter actions by namespace',
  marbles(m => {
    const actionType = 'actionType';
    const namespace = 'namespace';

    const inputsOutputs = {
      a: mockAction(actionType),
      b: mockAction(actionType, namespace),
    };

    const source = m.hot('aba', inputsOutputs);
    const expected = m.hot('-b-', inputsOutputs);

    m.expect(source.pipe(withNamespace(namespace))).toBeObservable(expected);
  })
);

test(
  'it should be possible to chain withNamespace, ofType and extractPayload',
  marbles(m => {
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
