import test from 'ava';
import { Observable } from 'rxjs';
import { markName } from 'rxbeach/internal';
import { merge, combineLatest, zip } from 'rxbeach';
import { NameMarker, MarkerType, findMarker } from 'rxbeach/internal/markers';
import { marbles } from 'rxjs-marbles/ava';

const source$ = new Observable<unknown>().pipe(markName('source'));
const dependency1$ = source$.pipe(markName('dependency1'));
const dependency2$ = source$.pipe(markName('dependency2'));

const source: NameMarker = {
  type: MarkerType.NAME,
  name: 'source',
  sources: [null],
};
const dependency1: NameMarker = {
  type: MarkerType.NAME,
  name: 'dependency1',
  sources: [source],
};
const dependency2: NameMarker = {
  type: MarkerType.NAME,
  name: 'dependency2',
  sources: [source],
};

const letters = { a: 'A', b: 'B', c: 'C', d: 'D' };
const combined = {
  B: ['A', 'B'] as [string, string],
  C: ['C', 'B'] as [string, string],
  D: ['C', 'D'] as [string, string],
};

test('merge adds name and merge marker', t => {
  const merged$ = merge(source$, dependency1$, dependency2$);

  t.deepEqual(findMarker(merged$), {
    type: MarkerType.MERGE,
    sources: [source, dependency1, dependency2],
  });
});

test(
  'merge emits for each emit from source',
  marbles(m => {
    const alpha$ = m.hot(' a-c', letters);
    const bravo$ = m.hot(' -b-', letters);
    const merged$ = m.hot('abc', letters);

    m.expect(merge(alpha$, bravo$)).toBeObservable(merged$);
  })
);

test('zip adds name and combine marker', t => {
  const derived$ = zip(source$, dependency1$, dependency2$);

  t.deepEqual(findMarker(derived$), {
    type: MarkerType.ZIP,
    sources: [source, dependency1, dependency2],
  });
});

test(
  'zip emits on emit from sources',
  marbles(m => {
    const alpha$ = m.hot('   a-c-', letters);
    const bravo$ = m.hot('   -b-d', letters);
    const combined$ = m.hot('-B-D', combined);

    m.expect(zip(alpha$, bravo$)).toBeObservable(combined$);
  })
);

test('combineLatest adds name and merge marker', t => {
  const combined$ = combineLatest(source$, dependency1$, dependency2$);

  t.deepEqual(findMarker(combined$), {
    type: MarkerType.COMBINE_LATEST,
    sources: [source, dependency1, dependency2],
  });
});

test(
  'combineLatest emits for each emit from source',
  marbles(m => {
    const alpha$ = m.hot('   a-c', letters);
    const bravo$ = m.hot('   -b-', letters);
    const combined$ = m.hot('-BC', combined);

    m.expect(combineLatest(alpha$, bravo$)).toBeObservable(combined$);
  })
);
