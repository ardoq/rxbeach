import { deepEqual } from 'assert';
import {
  createQualifiedActionCreator,
  ActionDispatcher,
  createChildDispatcher,
} from 'rxbeach';
import {
  actionWithPayload,
  AnyAction,
  actionWithoutPayload,
} from 'rxbeach/internal';

describe('qualifiers', function() {
  describe('createQualifiedActionCreator', function() {
    it('Should create actions with qualifier', function() {
      const type = 'action type';
      const parentQualifier = Symbol('parent qualifier');
      const childQualifier = Symbol('child qualifier');
      const actionCreator = (payload: number) =>
        actionWithPayload(type, payload, parentQualifier);
      actionCreator.type = type;

      const qualifiedActionCreator = createQualifiedActionCreator(
        childQualifier,
        actionCreator
      );

      const action = qualifiedActionCreator(12);

      deepEqual(action, actionWithPayload(type, 12, childQualifier));
    });
  });

  describe('createChildDispatcher', function() {
    it('Should invoke the parent dispatcher with qualified actions', function() {
      let dispatchedAction: AnyAction | undefined;
      const parentDispatcher: ActionDispatcher = action =>
        (dispatchedAction = action);

      const parentQualifier = Symbol('parent');
      const qualifier = Symbol('child');
      const childDispatcher = createChildDispatcher(
        parentDispatcher,
        qualifier
      );

      const action = actionWithoutPayload('action', parentQualifier);

      childDispatcher(action);

      deepEqual(dispatchedAction, {
        payload: undefined,
        ...actionWithoutPayload(action.type, qualifier),
      });
    });
  });
});
