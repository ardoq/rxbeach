import test from 'ava';
import { namespaceActionCreator, namespaceActionDispatcher } from './namespace';
import { ActionDispatcher } from './types/helpers';
import { UnknownAction } from './internal/types';
import { actionMarker } from './internal/markers';
import { _namespaceAction } from './namespace';
import { mockAction } from './internal/testing/utils';

const namespaced = _namespaceAction('namespace', mockAction('type')) as {
  type: string;
  meta: {
    namespace: string;
  };
};
test('_namespaceAction has unwritable type', t => {
  t.throws(
    () => {
      namespaced.type = 'foo';
    },
    { instanceOf: TypeError }
  );
});

test('_namespaceAction has unwritable meta', t => {
  t.throws(
    () => {
      namespaced.meta = { namespace: 'bar' };
    },
    { instanceOf: TypeError }
  );
});

test('_namespaceAction has unwritable namespace', t => {
  t.throws(
    () => {
      namespaced.meta.namespace = 'baz';
    },
    { instanceOf: TypeError }
  );
});

test('namespaceActionCreator should create actions with namespace', t => {
  const type = 'action type';
  const namespace = 'new namespace';
  const actionCreator = (payload: number) =>
    mockAction(type, 'old namespace', payload);
  actionCreator.type = type;
  actionCreator._marker = actionMarker(type);

  const namespacedActionCreator = namespaceActionCreator(
    namespace,
    actionCreator
  );

  const actionObject = namespacedActionCreator(12);
  t.deepEqual(actionObject, mockAction(type, namespace, 12));
});

test('namespaceActionDispatcher should invoke the parent dispatcher with namespaced actions', t => {
  let dispatchedAction: UnknownAction | undefined;
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
