import { equal, deepEqual, AssertionError } from 'assert';
import { actionCreator } from 'rxbeach';
import { assertThrows } from 'rxbeach/internal/testUtils';

describe('actionCreator', function() {
  describe('actionCreator', function() {
    type Payload = { num: number };
    const myAction = actionCreator<Payload>('three');
    const action = myAction({ num: 3 }) as {
      type: string;
      payload: Payload;
      meta: { namespace?: string };
    };

    it('Should create action creators and append the type', function() {
      equal(action.type, myAction.type);
      deepEqual(action.payload, { num: 3 });
    });
    it('Should protect the type field', function() {
      assertThrows(TypeError, () => {
        (myAction as any).type = 'lol';
      });
    });
    it('Should create action objects with protected type', function() {
      assertThrows(TypeError, () => {
        action.type = 'mock';
      });
    });
    it('Should create action objects with protected meta', function() {
      assertThrows(TypeError, () => {
        action.meta = {};
      });
    });
    it('Should create action objects with protected namespace', function() {
      assertThrows(TypeError, () => {
        action.meta.namespace = 'shim';
      });
    });
  });
});
