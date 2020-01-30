import test, { Macro } from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import {
  ActionWithPayload,
  actionCreator,
  namespaceActionCreator,
} from 'rxbeach';
import {
  extractPayload,
  withNamespace,
  ofType,
  carry,
  apply,
} from 'rxbeach/operators';
import { mockAction } from 'rxbeach/internal/testUtils';
import { map } from 'rxjs/operators';
import { Observable, pipe } from 'rxjs';
import { UnknownAction } from 'rxbeach/internal';
import { findMarker, MarkerType, OfTypeMarker } from 'rxbeach/internal/markers';

const extractsPayload: Macro<[any]> = (t, payload) =>
  marbles(m => {
    const source = m.hot<ActionWithPayload<any>>('aa', {
      a: mockAction('', '', payload) as ActionWithPayload<any>,
    });
    const expected = m.hot('pp', {
      p: payload,
    });

    m.expect(source.pipe(extractPayload())).toBeObservable(expected);
  })(t);
extractsPayload.title = name => `extractPayload should extract ${name} payload`;

test('primitive', extractsPayload, 'Hello World');
test('array', extractsPayload, ['Hello', { what: 'World' }]);
test('object', extractsPayload, { foo: true });

type FooPayload = {
  foo: number;
};

const voidAction = actionCreator('void');
const fooAction = actionCreator<FooPayload>('foo');
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

test('ofType should add a stream marker', t => {
  const piped$ = new Observable<UnknownAction>().pipe(ofType(voidAction));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.OF_TYPE,
    sources: [
      {
        type: MarkerType.ACTION,
        name: voidAction.type,
      },
    ],
  });
});

test('ofType markers should have reference equality of action marker', t => {
  const one$ = new Observable<UnknownAction>().pipe(ofType(voidAction));
  const two$ = new Observable<UnknownAction>().pipe(ofType(voidAction));
  const one = findMarker(one$) as OfTypeMarker;
  const two = findMarker(two$) as OfTypeMarker;

  t.assert(one.sources[0] === two.sources[0]);
});

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
      source.pipe(withNamespace('NS'), ofType(payloadAction), extractPayload())
    ).toBeObservable(expected);
  })
);

test(
  'carry should combine initial payload with the results of the operator',
  marbles(m => {
    const source = m.hot(' f', { f });
    const expected = m.hot('1', {
      '1': [f.payload, f.payload.foo] as [FooPayload, number],
    });

    m.expect(
      source.pipe(extractPayload(), carry(map(e => e.foo)))
    ).toBeObservable(expected);
  })
);

test(
  'apply should provide context to operators',
  marbles(m => {
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
