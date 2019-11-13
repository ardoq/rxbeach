import test from 'ava';
import { of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { actionCreator } from 'rxbeach';
import { AnyAction } from 'rxbeach/internal';
import { ofType } from 'rxbeach/operators';
import { routine, collectRoutines } from 'rxbeach/routines';

const ping = actionCreator('[game] ping');
const pong = actionCreator('[game] pong');

const dispatched: AnyAction[] = [];
const pongs: 'pong'[] = [];

const logPongs = routine(
  ofType(pong),
  tap(() => pongs.push('pong')) // Simulates console.log
);
const pongPings = routine(
  ofType(ping),
  map(() => pong()),
  tap(dispatched.push.bind(dispatched)) // Simulates tap(dispatchAction)
);

const routines = collectRoutines(logPongs, pongPings);

test('works', async t => {
  await of(ping(), pong())
    .pipe(routines)
    .toPromise();

  t.deepEqual(dispatched, [
    { type: '[game] pong', meta: {}, payload: undefined },
  ]);
  t.deepEqual(pongs, ['pong']);
});
