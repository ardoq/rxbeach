import test from 'ava';
import { of } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { actionCreator, namespaceActionCreator } from 'rxbeach';
import { withNamespace } from 'rxbeach/operators';
import { AnyAction } from 'rxbeach/internal';

const testAction = actionCreator<number>('[test] primitive action');
const namespaceA = 'A';
const namespaceB = 'B';

const testActionA = namespaceActionCreator(namespaceA, testAction);
const testActionB = namespaceActionCreator(namespaceB, testAction);
const actionObjectA = testActionA(1);
const actionObjectB = testActionB(2);

let lastActionNamespaceA: AnyAction | undefined;
let lastActionNamespaceB: AnyAction | undefined;
let sumAllNamespaces: number | undefined;

test.before(async function() {
  const action$ = of(actionObjectA, actionObjectB);
  const actionA$ = action$.pipe(withNamespace(namespaceA));
  const actionB$ = action$.pipe(withNamespace(namespaceB));
  const sum$ = action$.pipe(reduce((a, b) => a + (b.payload || 0), 0));

  lastActionNamespaceA = await actionA$.toPromise();
  lastActionNamespaceB = await actionB$.toPromise();
  sumAllNamespaces = await sum$.toPromise();
});

test.after(async function() {
  lastActionNamespaceA = undefined;
  lastActionNamespaceB = undefined;
  sumAllNamespaces = undefined;
});

test('can filter namespace A', t => {
  t.is(lastActionNamespaceA, actionObjectA);
});
test('can filter namespace B', t => {
  t.is(lastActionNamespaceB, actionObjectB);
});
test('dispatches to main action$', t => {
  t.is(sumAllNamespaces, 3);
});
