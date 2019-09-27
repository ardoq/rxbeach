import { equal, deepEqual } from 'assert';
import { of, Subject } from 'rxjs';
import { reduce } from 'rxjs/operators';
import {
  actionCreator,
  namespaceActionCreator,
  namespaceActionDispatcher,
} from 'rxbeach';
import { withNamespace } from 'rxbeach/operators';
import { AnyAction, mockAction } from 'rxbeach/internal';

export default function namespaceExamples() {
  describe('namespaces', function() {
    const testAction = actionCreator<number>('[test] primitive action');
    const namespaceA = 'A';
    const namespaceB = 'B';

    describe('namespacing action creators', function() {
      const testActionA = namespaceActionCreator(namespaceA, testAction);
      const testActionB = namespaceActionCreator(namespaceB, testAction);
      const actionObjectA = testActionA(1);
      const actionObjectB = testActionB(2);

      let lastActionNamespaceA: AnyAction | undefined;
      let lastActionNamespaceB: AnyAction | undefined;
      let sumAllNamespaces: number | undefined;
      this.afterEach(async function() {
        lastActionNamespaceA = undefined;
        lastActionNamespaceB = undefined;
        sumAllNamespaces = undefined;
      });

      this.beforeEach(async function() {
        const action$ = of(actionObjectA, actionObjectB);
        const actionA$ = action$.pipe(withNamespace(namespaceA));
        const actionB$ = action$.pipe(withNamespace(namespaceB));
        const sum$ = action$.pipe(reduce((a, b) => a + (b.payload || 0), 0));

        lastActionNamespaceA = await actionA$.toPromise();
        lastActionNamespaceB = await actionB$.toPromise();
        sumAllNamespaces = await sum$.toPromise();
      });

      it('can filter namespace A', async function() {
        equal(lastActionNamespaceA, actionObjectA);
      });
      it('can filter namespace B', async function() {
        equal(lastActionNamespaceB, actionObjectB);
      });
      it('dispatches to main action$', async function() {
        equal(sumAllNamespaces, 3);
      });
    });

    describe('namespacing action dispatchers', function() {
      let lastActionNamespaceA: AnyAction | undefined;
      let lastActionNamespaceB: AnyAction | undefined;
      let sumAllNamespaces: number | undefined;
      this.afterEach(function() {
        lastActionNamespaceA = undefined;
        lastActionNamespaceB = undefined;
        sumAllNamespaces = undefined;
      });

      this.beforeEach(async function() {
        const action$ = new Subject<AnyAction>();
        const dispatchAction = action$.next.bind(action$);

        const dispatchA = namespaceActionDispatcher(namespaceA, dispatchAction);
        const dispatchB = namespaceActionDispatcher(namespaceB, dispatchAction);

        const a_p = action$.pipe(withNamespace(namespaceA)).toPromise();
        const b_p = action$.pipe(withNamespace(namespaceB)).toPromise();
        const sum_p = action$
          .pipe(reduce((a: any, b: any) => a + (b.payload || 0), 0))
          .toPromise();

        dispatchA(testAction(1));
        dispatchB(testAction(2));
        action$.complete();

        const [a, b, sum] = await Promise.all([a_p, b_p, sum_p]);

        lastActionNamespaceA = a;
        lastActionNamespaceB = b;
        sumAllNamespaces = sum;
      });

      it('applies namespace A', function() {
        deepEqual(
          lastActionNamespaceA,
          mockAction(testAction.type, namespaceA, 1)
        );
      });

      it('applies namespace B', function() {
        deepEqual(
          lastActionNamespaceB,
          mockAction(testAction.type, namespaceB, 2)
        );
      });

      it('dispatches to root action$', function() {
        equal(sumAllNamespaces, 3);
      });
    });
  });
}
