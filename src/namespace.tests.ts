import { deepEqual } from 'assert';
import {
  namespaceActionCreator,
  ActionDispatcher,
  namespaceActionDispatcher,
} from 'rxbeach';
import { mockAction, AnyAction } from 'rxbeach/internal';

describe('namespace', function() {
  describe('namespaceActionCreator', function() {
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

    it('Should create actions with namespace', function() {
      deepEqual(actionObject, mockAction(type, namespace, 12));
    });
  });

  describe('namespaceActionDispatcher', function() {
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

    it('Should invoke the parent dispatcher with namespaced actions', function() {
      deepEqual(dispatchedAction, {
        payload: undefined,
        ...mockAction(actionObject.type, namespace),
      });
    });
  });
});
