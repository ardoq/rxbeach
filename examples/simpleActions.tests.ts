import createActionCreator from 'createActionCreator';
import { equal, deepEqual } from 'assert';
import { of } from 'rxjs';
import { ofType, extractPayload } from 'operators';
import { map } from 'rxjs/operators';
import { ExtractPayload } from 'types/helpers';

describe('example', function() {
  describe('simple actions', function() {
    const voidAction = createActionCreator('[test] void action');
    const primitiveAction = createActionCreator<number>(
      '[test] primitive action'
    );
    type Payload = { foo: number };
    const payloadAction = createActionCreator<Payload>('[test] payload action');

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
        .pipe(ofType(primitiveAction.type))
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

    type Extracted = ExtractPayload<typeof payloadAction>;
    const payload_assignable_to_extracted: Extracted = (null as any) as Payload;
    const extracted_assignable_to_payload: Payload = (null as any) as Extracted;
  });
});
