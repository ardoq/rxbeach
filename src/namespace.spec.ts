import test from 'ava';
import {
  namespaceActionCreator,
  ActionDispatcher,
  namespaceActionDispatcher,
} from 'rxbeach';
import { mockAction, AnyAction } from 'rxbeach/internal';
import { _namespaceAction } from 'rxbeach/namespace';

const namespaced = _namespaceAction('namespace', mockAction('type')) as {
  type: string;
  meta: {
    namespace: string;
  };
};
test('_namespaceAction has unwritable type', t => {
  t.throws(() => {
    namespaced.type = 'foo';
  }, TypeError);
});

test('_namespaceAction has unwritable meta', t => {
  t.throws(() => {
    namespaced.meta = { namespace: 'bar' };
  }, TypeError);
});

test('_namespaceAction has unwritable namespace', t => {
  t.throws(() => {
    namespaced.meta.namespace = 'baz';
  }, TypeError);
});

test('namespaceActionCreator should create actions with namespace', t => {
  const type = 'action type';
  const namespace = 'new namespace';
  const actionCreator = (payload: number) =>
    mockAction(type, 'old namespace', payload);
  actionCreator.type = type;

  const namespacedActionCreator = namespaceActionCreator(
    namespace,
    actionCreator
  );

  const actionObject = namespacedActionCreator(12);
  t.deepEqual(actionObject, mockAction(type, namespace, 12));
});

test('namespaceActionDispatcher should invoke the parent dispatcher with namespaced actions', t => {
  let dispatchedAction: AnyAction | undefined;
  const parentDispatcher: ActionDispatcher = action =>
    (dispatchedAction = action);

  const namespace = 'new namespace';
  const childDispatcher = namespaceActionDispatcher(
    namespace,
    parentDispatcher
  );

  const actionObject = mockAction('action', 'old namespace');

  childDispatcher(actionObject);

  t.deepEqual(dispatchedAction, {
    payload: undefined,
    ...mockAction(actionObject.type, namespace),
  });
});