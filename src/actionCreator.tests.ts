import { equal } from 'assert';
import { actionCreator } from 'rxbeach';

describe('actionCreator', function() {
  describe('actionCreator', function() {
    it('Should create action creators and append the type', function() {
      const myAction = actionCreator<3>('three');
      const action = myAction(3);

      equal(action.type, myAction.type);
      equal(action.payload, 3);
    });
  });
});
