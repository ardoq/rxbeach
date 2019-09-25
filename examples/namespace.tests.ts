import { equal, deepEqual } from 'assert';
import { of, Subject } from 'rxjs';
import { reduce } from 'rxjs/operators';
import {
  actionCreator,
  namespaceActionCreator,
  namespaceActionDispatcher,
  ActionWithPayload,
} from 'rxbeach';
import { withNamespace } from 'rxbeach/operators';
import { AnyAction, actionWithPayload } from 'rxbeach/internal';

const sumOp = reduce(
  (a, b) => a + ((b as ActionWithPayload<number>).payload || 0),
  0
);

export default function namespaceExamples() {
  describe('namespaces', function() {
    const testAction = actionCreator<number>('[test] primitive action');
    const namespaceA = 'A';
    const namespaceB = 'B';

    it('can namespace the action creators', async function() {
      const testActionA = namespaceActionCreator(namespaceA, testAction);
      const testActionB = namespaceActionCreator(namespaceB, testAction);

      const action$ = of(testActionA(1), testActionB(2));

      const a = await action$.pipe(withNamespace(namespaceA)).toPromise();
      const b = await action$.pipe(withNamespace(namespaceB)).toPromise();
      const sum = await action$.pipe(sumOp).toPromise();

      deepEqual(a, actionWithPayload(testAction.type, 1, namespaceA));
      deepEqual(b, actionWithPayload(testAction.type, 2, namespaceB));
      equal(sum, 3);
    });

    it('can namespace dispatchAction', async function() {
      const action$ = new Subject<AnyAction>();
      const dispatchAction = action$.next.bind(action$);

      const dispatchA = namespaceActionDispatcher(namespaceA, dispatchAction);
      const dispatchB = namespaceActionDispatcher(namespaceB, dispatchAction);

      const a_p = action$.pipe(withNamespace(namespaceA)).toPromise();
      const b_p = action$.pipe(withNamespace(namespaceB)).toPromise();
      const sum_p = action$.pipe(sumOp).toPromise();

      dispatchA(testAction(1));
      dispatchB(testAction(2));
      action$.complete();

      const [a, b, sum] = await Promise.all([a_p, b_p, sum_p]);

      deepEqual(a, actionWithPayload(testAction.type, 1, namespaceA));
      deepEqual(b, actionWithPayload(testAction.type, 2, namespaceB));
      equal(sum, 3);
    });
  });
}
