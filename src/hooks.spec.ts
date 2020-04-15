import test from 'ava';
import { clearHooks, hookMarkers, notifyStreamSubscribed } from './hooks';
import { never } from 'rxjs';
import { markName } from './internal';
import { MarkerType } from './internal/markers';

test.afterEach(() => clearHooks());

test('marker hooks are invoked', (t) => {
  const stream = never().pipe(markName('test'));

  hookMarkers((marker) => {
    t.deepEqual(marker.type, MarkerType.NAME);
  });

  notifyStreamSubscribed(stream);
});

test('marker hooks are not invoked for streams without markers', (t) => {
  hookMarkers(() => {
    t.fail('hooks should not be invoked');
  });

  notifyStreamSubscribed(never());
  t.pass();
});

test('marker hooks can be unsubscribed', (t) => {
  const stream = never().pipe(markName('test'));

  const unhook = hookMarkers(() => {
    t.fail('hook should not be invoked');
  });

  unhook();
  notifyStreamSubscribed(stream);
  t.pass();
});
