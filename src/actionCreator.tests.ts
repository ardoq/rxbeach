import { equal, AssertionError, deepEqual } from 'assert';
import { actionCreator } from 'rxbeach';

describe('actionCreator', function() {
  const payload = { num: 2 };
  const testAction = actionCreator<typeof payload>('test');
  const action = testAction(payload);
  const editable = action as { payload: typeof payload };

  it('Should create action creators and append the type', function() {
    equal(action.type, testAction.type);
    deepEqual(action.payload, payload);
  });

  it('should protect the fields', function() {
    try {
      editable.payload.num = 3;
      throw new AssertionError({
        message: 'payload properties should not be writable',
      });
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });

  it('should protect the payload fields', function() {
    try {
      editable.payload = { num: 4 };
      throw new AssertionError({
        message: 'payload should not be writable',
      });
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
});
