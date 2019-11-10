import test from 'ava';
import { actionCreator } from 'rxbeach';

type Payload = { num: number };
const myAction = actionCreator<Payload>('three');
const action = myAction({ num: 3 }) as {
  type: string;
  payload: Payload;
  meta: { namespace?: string };
};

test('actionCreator should create action creators and append the type', t => {
  t.is(action.type, myAction.type);
  t.deepEqual(action.payload, { num: 3 });
});
test('actionCreator should protect the type field', t => {
  t.throws(() => {
    (myAction as any).type = 'lol';
  }, TypeError);
});
test('actionCreator should create action objects with protected type', t => {
  t.throws(() => {
    action.type = 'mock';
  }, TypeError);
});
test('actionCreator should create action objects with protected meta', t => {
  t.throws(() => {
    action.meta = {};
  }, TypeError);
});
test('actionCreator should create action objects with protected namespace', t => {
  t.throws(() => {
    action.meta.namespace = 'shim';
  }, TypeError);
});
