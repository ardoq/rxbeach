import { deepEqual } from 'assert';
import {
  namespaceActionCreator,
  ActionDispatcher,
  namespaceActionDispatcher,
} from 'rxbeach';
import {
  actionWithPayload,
  AnyAction,
  actionWithoutPayload,
} from 'rxbeach/internal';

describe('namespace', function() {
  describe('namespaceActionCreator', function() {
    it('Should create actions with namespace', function() {
      const type = 'action type';
      const namespace = Symbol('new namespace');
      const actionCreator = (payload: number) =>
        actionWithPayload(type, payload, Symbol('old namespace'));
      actionCreator.type = type;

      const namespacedActionCreator = namespaceActionCreator(
        namespace,
        actionCreator
      );

      const action = namespacedActionCreator(12);

      deepEqual(action, actionWithPayload(type, 12, namespace));
    });
  });

  describe('namespaceActionDispatcher', function() {
    it('Should invoke the parent dispatcher with namespaced actions', function() {
      let dispatchedAction: AnyAction | undefined;
      const parentDispatcher: ActionDispatcher = action =>
        (dispatchedAction = action);

      const namespace = Symbol('new namespace');
      const childDispatcher = namespaceActionDispatcher(
        namespace,
        parentDispatcher
      );

      const action = actionWithoutPayload('action', Symbol('old namespace'));

      childDispatcher(action);

      deepEqual(dispatchedAction, {
        payload: undefined,
        ...actionWithoutPayload(action.type, namespace),
      });
    });
  });
});
