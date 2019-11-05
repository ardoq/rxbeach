import { deepEqual } from 'assert';
import {
  namespaceActionCreator,
  ActionDispatcher,
  namespaceActionDispatcher,
} from 'rxbeach';
import { mockAction, AnyAction, assertThrows } from 'rxbeach/internal';
import { _namespaceAction } from './namespace';

describe('namespace', function() {
  describe('_namespaceAction', function() {
    const namespaced = _namespaceAction('namespace', mockAction('type')) as {
      type: string;
      meta: {
        namespace: string;
      };
    };
    it('has unwritable type', function() {
      assertThrows(TypeError, () => {
        namespaced.type = 'foo';
      });
    });
    it('has unwritable meta', function() {
      assertThrows(TypeError, () => {
        namespaced.meta = { namespace: 'bar' };
      });
    });
    it('has unwritable namespace', function() {
      assertThrows(TypeError, () => {
        namespaced.meta.namespace = 'baz';
      });
    });
  });
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
