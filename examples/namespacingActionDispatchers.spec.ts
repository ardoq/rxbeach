import test from 'ava';
import { Subject } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { actionCreator, namespaceActionDispatcher } from 'rxbeach';
import { withNamespace } from 'rxbeach/operators';
import { UnknownAction } from 'rxbeach/internal';
import { mockAction } from 'rxbeach/internal/testUtils';
const testAction = actionCreator<number>('[test] primitive action');
const namespaceA = 'A';
const namespaceB = 'B';

let lastActionNamespaceA: UnknownAction | undefined;
let lastActionNamespaceB: UnknownAction | undefined;
let sumAllNamespaces: number | undefined;

test.before(async function() {
  const action$ = new Subject<UnknownAction>();
  const dispatchAction = action$.next.bind(action$);

  const dispatchA = namespaceActionDispatcher(namespaceA, dispatchAction);
  const dispatchB = namespaceActionDispatcher(namespaceB, dispatchAction);

  const aP = action$.pipe(withNamespace(namespaceA)).toPromise();
  const bP = action$.pipe(withNamespace(namespaceB)).toPromise();
  const sumP = action$
    .pipe(reduce((a: any, b: any) => a + (b.payload || 0), 0))
    .toPromise();

  dispatchA(testAction(1));
  dispatchB(testAction(2));
  action$.complete();

  const [a, b, sum] = await Promise.all([aP, bP, sumP]);

  lastActionNamespaceA = a;
  lastActionNamespaceB = b;
  sumAllNamespaces = sum;
});

test.after(function() {
  lastActionNamespaceA = undefined;
  lastActionNamespaceB = undefined;
  sumAllNamespaces = undefined;
});

test('applies namespace A', t => {
  t.deepEqual(lastActionNamespaceA, mockAction(testAction.type, namespaceA, 1));
});

test('applies namespace B', t => {
  t.deepEqual(lastActionNamespaceB, mockAction(testAction.type, namespaceB, 2));
});

test('dispatches to root action$', t => {
  t.is(sumAllNamespaces, 3);
});
