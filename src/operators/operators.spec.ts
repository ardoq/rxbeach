import { marbles } from 'rxjs-marbles/jest';
import { ActionWithPayload } from '../types/Action';
import { actionCreator } from '../actionCreator';
import { namespaceActionCreator } from '../namespace';
import {
  apply,
  carry,
  extractPayload,
  ofType,
  withNamespace,
  withoutNamespace,
} from './operators';
import { mockAction } from '../internal/testing/utils';
import { map } from 'rxjs/operators';
import { pipe } from 'rxjs';
import { incrementMocks } from '../internal/testing/mock';

const {
  namespace,
  marbles: { actions },
} = incrementMocks;

test.each`
  name           | payload
  ${'primitive'} | ${'Hello World'}
  ${'array'}     | ${['Hello', { what: 'World' }]}
  ${'object'}    | ${{ foo: true }}
`(
  `extractPayload should extract {name} payload`,
  ({ payload }: { name: string; payload: unknown }) => {
    marbles((m) => {
      const source = m.hot<ActionWithPayload<any>>('aa', {
        a: mockAction('', '', payload) as ActionWithPayload<any>,
      });
      const expected = m.hot('pp', {
        p: payload,
      });

      m.expect(source.pipe(extractPayload())).toBeObservable(expected);
    })();
  }
);
// test('primitive', extractsPayload, 'Hello World');
// test('array', extractsPayload, ['Hello', { what: 'World' }]);
// test('object', extractsPayload, { foo: true });

type FooPayload = {
  foo: number;
};

const voidAction = actionCreator('[test] void');
const fooAction = actionCreator<FooPayload>('[test] foo');
const barAction = actionCreator<{ bar: number }>('[test] bar');
const combinedAction = actionCreator<{ foo: number; bar: number }>(
  '[test] extended'
);

const v = voidAction();
const f = fooAction({ foo: 1 });
const b = barAction({ bar: 2 });
const c = combinedAction({ foo: 2, bar: 3 });

test(
  'ofType should filter one payload action type',
  marbles((m) => {
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
  marbles((m) => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('--v', { v });

    m.expect(source.pipe(ofType(voidAction))).toBeObservable(expected);
  })
);

test(
  'ofType should filter multiple actions that are mix of void and not void',
  marbles((m) => {
    const source = m.hot('fcv', { f, c, v });
    const expected = m.hot('f-v', { f, v });

    m.expect(source.pipe(ofType(fooAction, voidAction))).toBeObservable(
      expected
    );
  })
);

test(
  'ofType should infer payload of multiple types that are overlapping',
  marbles((m) => {
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
  marbles((m) => {
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
  'withNamespace should exclude actions with the wrong namespace',
  marbles((m) => {
    const source = m.hot('  m1n', actions);
    const expected = m.hot('-1n', actions);

    m.expect(source.pipe(withNamespace(namespace))).toBeObservable(expected);
  })
);

test(
  'it should be possible to chain withNamespace, ofType and extractPayload',
  marbles((m) => {
    const payloadAction = actionCreator<number>('[test] payload action');
    const payloadActionWS = namespaceActionCreator('WS', payloadAction);
    const payloadActionNS = namespaceActionCreator('NS', payloadAction);
    const voidActionWS = namespaceActionCreator('WS', voidAction);
    const voidActionNS = namespaceActionCreator('NS', voidAction);

    const payloads = {
      p: 2,
      q: 3,
    };
    const namespaceActions = {
      v: voidActionWS(),
      w: voidActionNS(),
      p: payloadActionWS(payloads.p),
      q: payloadActionNS(payloads.q),
    };

    const source = m.hot('  pvwqwvp', namespaceActions);
    const expected = m.hot('---q---', payloads);

    m.expect(
      source.pipe(withNamespace('NS'), ofType(payloadAction), extractPayload())
    ).toBeObservable(expected);
  })
);

test(
  'withoutNamespace should exclude actions with any namespace',
  marbles((m) => {
    const source = m.hot('  n1m', actions);
    const expected = m.hot('-1-', actions);

    m.expect(source.pipe(withoutNamespace())).toBeObservable(expected);
  })
);

test(
  'withoutNamespace should exclude actions with specific namespace',
  marbles((m) => {
    const source = m.hot('  n1m', actions);
    const expected = m.hot('-1m', actions);

    m.expect(source.pipe(withoutNamespace(namespace))).toBeObservable(expected);
  })
);

test(
  'carry should combine initial payload with the results of the operator',
  marbles((m) => {
    const source = m.hot(' f', { f });
    const expected = m.hot('1', {
      '1': [f.payload, f.payload.foo] as [FooPayload, number],
    });

    m.expect(
      source.pipe(extractPayload(), carry(map((e) => e.foo)))
    ).toBeObservable(expected);
  })
);
test(
  'carry only subscribes to the original observable once',
  marbles((m) => {
    const source$ = m.cold(' f', { f });
    const expected = m.hot('1', {
      '1': [f.payload, f.payload.foo] as [FooPayload, number],
    });
    m.expect(
      source$.pipe(extractPayload(), carry(map((e) => e.foo)))
    ).toBeObservable(expected);
    m.expect(source$).toHaveSubscriptions(['  ^']);
  })
);
test(
  'apply should provide context to operators',
  marbles((m) => {
    const source = m.hot('  f', { f });
    const expected = m.hot('n', { n: f.payload.foo });

    m.expect(
      source.pipe(
        extractPayload(),
        apply(({ foo }) =>
          pipe(
            map(() => undefined),
            map(() => foo)
          )
        )
      )
    ).toBeObservable(expected);
  })
);
