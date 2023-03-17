import { namespaceActionCreator, namespaceActionDispatcher } from './namespace';
import { ActionDispatcher } from './types/helpers';
import { UnknownAction } from './internal/types';
import { _namespaceAction } from './namespace';
import { mockAction } from './internal/testing/utils';

const namespaced = _namespaceAction('namespace', mockAction('type')) as {
  type: string;
  meta: {
    namespace: string;
  };
};
test('_namespaceAction has unwritable type', () => {
  expect(() => {
    namespaced.type = 'foo';
  }).toThrow(TypeError);
});

test('_namespaceAction has unwritable meta', () => {
  expect(() => {
    namespaced.meta = { namespace: 'bar' };
  }).toThrow(TypeError);
});

test('_namespaceAction has unwritable namespace', () => {
  expect(() => {
    namespaced.meta.namespace = 'baz';
  }).toThrow(TypeError);
});

test('namespaceActionCreator should create actions with namespace', () => {
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
  expect(actionObject).toEqual(mockAction(type, namespace, 12));
});

test('namespaceActionDispatcher should invoke the parent dispatcher with namespaced actions', () => {
  let dispatchedAction: UnknownAction | undefined;
  const parentDispatcher: ActionDispatcher = (action) =>
    (dispatchedAction = action);

  const namespace = 'new namespace';
  const childDispatcher = namespaceActionDispatcher(
    namespace,
    parentDispatcher
  );

  const actionObject = mockAction('action', 'old namespace');

  childDispatcher(actionObject);

  expect(dispatchedAction).toEqual({
    ...mockAction(actionObject.type, namespace),
  });
});
