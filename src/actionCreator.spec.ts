import test from 'ava';
import { actionCreator } from './actionCreator';

type Payload = { num: number };
const myAction = actionCreator<Payload>('three');
const action = myAction({ num: 3 }) as {
  type: string;
  payload: Payload;
  meta: { namespace?: string };
};
type AlternativePayload = { text: string };
const unionAction = actionCreator<Payload | AlternativePayload>('union');
const union1 = unionAction({ num: 4 });
const union2 = unionAction({ text: 'hi' });

test('actionCreator should create action creators and append the type', (t) => {
  t.is(action.type, myAction.type);
  t.deepEqual(action.payload, { num: 3 });
});
test('actionCreator should protect the type field', (t) => {
  t.throws(
    () => {
      (myAction as any).type = 'lol';
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with the payload', (t) => {
  t.deepEqual(action.payload, { num: 3 });
  t.deepEqual(union1.payload, { num: 4 });
  t.deepEqual(union2.payload, { text: 'hi' });
});
test('actionCreator should create action objects with protected type', (t) => {
  t.throws(
    () => {
      action.type = 'mock';
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with protected meta', (t) => {
  t.throws(
    () => {
      action.meta = {};
    },
    { instanceOf: TypeError }
  );
});
test('actionCreator should create action objects with protected namespace', (t) => {
  t.throws(
    () => {
      action.meta.namespace = 'shim';
    },
    { instanceOf: TypeError }
  );
});
