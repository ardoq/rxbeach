import { deepEqual, equal } from 'assert';
import { of, pipe } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import {
  combineActionOperators,
  registerActionOperators,
} from 'stream-patterns/actionOperators';
import {
  actionWithoutPayload,
  toHistoryPromise,
} from 'stream-patterns/testUtils';
import { AnyAction } from 'stream-patterns/types/Action';
import { ActionDispatcher } from 'stream-patterns/types/helpers';

describe('actionOperators', function() {
  describe('combineActionOperators', function() {
    it('Should work', async function() {
      const one = actionWithoutPayload(Symbol('one'));
      const two = actionWithoutPayload(Symbol('two'));
      const three = actionWithoutPayload(Symbol('three'));
      const alpha = actionWithoutPayload(Symbol('alpha'));
      const bravo = actionWithoutPayload(Symbol('bravo'));

      const combined = combineActionOperators(
        {
          type: one.type,
          operator: mapTo(alpha),
        },
        {
          types: [two.type, three.type],
          operator: mapTo(bravo),
        }
      );

      const res = await toHistoryPromise(of(one, two, three).pipe(combined));

      deepEqual(res, [alpha, bravo, bravo]);
    });
  });
  describe('registerActionOperators', function() {
    it('Should work', async function() {
      let lastAction: AnyAction | null = null;
      const dispatchAction: ActionDispatcher = action => (lastAction = action);

      const one = actionWithoutPayload(Symbol('one'));
      const two = actionWithoutPayload(Symbol('two'));

      const routine = pipe(
        mapTo(two),
        tap(dispatchAction)
      );

      const s = registerActionOperators(of(one), routine);

      equal(lastAction, two);

      s.unsubscribe();
    });
  });
});
