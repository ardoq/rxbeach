import { equal, deepEqual } from 'assert';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { actionCreator, ExtractPayload } from 'rxbeach';
import { ofTypes, extractPayload, ofType } from 'rxbeach/operators';

export default function actionExamples() {
  describe('actions', function() {
    const voidAction = actionCreator('[test] void action');
    const primitiveAction = actionCreator<number>('[test] primitive action');
    type Payload = { foo: number };
    const payloadAction = actionCreator<Payload>('[test] payload action');

    it('creates action objects', function() {
      const a = voidAction();
      const b = primitiveAction(321);
      const c = payloadAction({ foo: 123 });

      equal((a as any).payload, undefined);
      equal(b.payload, 321);
      deepEqual(c.payload, { foo: 123 });
    });

    it('can filter actions', async function() {
      const a = primitiveAction(12);
      const r = await of(voidAction(), a, payloadAction({ foo: 123 }))
        .pipe(ofTypes(primitiveAction.type))
        .toPromise();

      equal(r, a);
    });

    it('can extract payloads', async function() {
      const r = await of(payloadAction({ foo: 48 }))
        .pipe(
          extractPayload(),
          map(({ foo }) => foo)
        )
        .toPromise();

      equal(r, 48);
    });

    it('can filter actions and extract payloads', async function() {
      const r = await of(payloadAction({ foo: 43 }), voidAction())
        .pipe(
          ofType(payloadAction),
          extractPayload(),
          map(({ foo }) => foo)
        )
        .toPromise();

      equal(r, 43);
    });

    type Extracted = ExtractPayload<typeof payloadAction>;
    const payload_assignable_to_extracted: Extracted = (null as any) as Payload;
    const extracted_assignable_to_payload: Payload = (null as any) as Extracted;
  });
}
