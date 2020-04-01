import test from 'ava';
import {
  markName,
  findMarker,
  MarkerType,
  NameMarker,
} from './internal/markers';
import { Observable } from 'rxjs';
import { derivedStream } from './derivedStream';
import { marbles } from 'rxjs-marbles/ava';

test('derivedStream adds name and combine marker', (t) => {
  const source$ = new Observable<unknown>().pipe(markName('source'));
  const dependency$ = source$.pipe(markName('dependency'));

  const derived$ = derivedStream('derived', source$, dependency$);

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
        type: MarkerType.COMBINE_LATEST,
        sources: [sourceNameMarker, dependencyNameMarker],
      },
    ],
  });
});

test(
  'derivedStream emits on emit from either source',
  marbles((m) => {
    const letters = { a: 'A', b: 'B', c: 'C' };
    const combined = {
      B: ['A', 'B'] as [string, string],
      C: ['C', 'B'] as [string, string],
    };
    const alpha$ = m.hot('   a-c', letters);
    const bravo$ = m.hot('   -b-', letters);
    const combined$ = m.hot('-BC', combined);

    m.expect(derivedStream('combined', alpha$, bravo$)).toBeObservable(
      combined$
    );
  })
);
