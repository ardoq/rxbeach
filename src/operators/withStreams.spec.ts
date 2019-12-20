import test from 'ava';
import { markName } from 'rxbeach/internal';
import { Observable } from 'rxjs';
import { withStreams } from 'rxbeach/operators';
import { findMarker, MarkerType, NameMarker } from 'rxbeach/internal/markers';
import { marbles } from 'rxjs-marbles/ava';

test('derivedStream adds name and combine marker', t => {
  const source$ = new Observable<unknown>().pipe(markName('source'));
  const dependency$ = source$.pipe(markName('dependency'));

  const derived$ = source$.pipe(withStreams('derived', dependency$));

  const sourceNameMarker: NameMarker = {
    type: MarkerType.NAME,
    name: 'source',
    sources: [null],
  };
  const dependencyNameMarker: NameMarker = {
    type: MarkerType.NAME,
    name: 'dependency',
    sources: [sourceNameMarker],
  };
  t.deepEqual(findMarker(derived$), {
    type: MarkerType.NAME,
    name: 'derived',
    sources: [
      {
        type: MarkerType.WITH_LATEST,
        sources: [sourceNameMarker],
        dependencies: [dependencyNameMarker],
      },
    ],
  });
});

test(
  'derivedStream emits on emit from source',
  marbles(m => {
    const letters = { a: 'A', b: 'B', c: 'C' };
    const combined = {
      B: ['A', 'B'] as [string, string],
      C: ['C', 'B'] as [string, string],
    };
    const alpha$ = m.hot('   a-c', letters);
    const bravo$ = m.hot('   -b-', letters);
    const combined$ = m.hot('--C', combined);

    m.expect(alpha$.pipe(withStreams('combined', bravo$))).toBeObservable(
      combined$
    );
  })
);
