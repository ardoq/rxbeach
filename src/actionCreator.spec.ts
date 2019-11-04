import test from 'ava';
import { actionCreator } from './index';

test('Should create action creators and append the type', t => {
  const myAction = actionCreator<3>('three');
  const action = myAction(3);

  t.is(action.type, myAction.type);
  t.is(action.payload, 3);
});
