import test from 'ava';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { actionCreator } from 'rxbeach';
import { extractPayload, ofType } from 'rxbeach/operators';

const voidAction = actionCreator('[test] void action');
const primitiveAction = actionCreator<number>('[test] primitive action');
type Payload = { foo: number };
const payloadAction = actionCreator<Payload>('[test] payload action');

test('creates action objects', t => {
  const a = voidAction();
  const b = primitiveAction(321);
  const c = payloadAction({ foo: 123 });

  t.is((a as any).payload, undefined);
  t.is(b.payload, 321);
  t.deepEqual(c.payload, { foo: 123 });
});

test('can filter actions', async t => {
  const a = primitiveAction(12);
  const r = await of(voidAction(), a, payloadAction({ foo: 123 }))
    .pipe(ofType(primitiveAction))
    .toPromise();

  t.is(r, a);
});

test('can extract payloads', async t => {
  const r = await of(payloadAction({ foo: 48 }))
    .pipe(
      extractPayload(),
      map(({ foo }) => foo)
    )
    .toPromise();

  t.is(r, 48);
});

test('can filter actions and extract payloads', async t => {
  const r = await of(payloadAction({ foo: 43 }), voidAction())
    .pipe(
      ofType(payloadAction),
      extractPayload(),
      map(({ foo }) => foo)
    )
    .toPromise();

  t.is(r, 43);
});
