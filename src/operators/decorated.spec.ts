import test from 'ava';
import { Observable } from 'rxjs';
import { markName } from 'rxbeach/internal';
import {
  withLatestFrom,
  merge,
  combineLatest,
  startWith,
} from 'rxbeach/operators';
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

const letters = { a: 'A', b: 'B', c: 'C' };
const combined = {
  B: ['A', 'B'] as [string, string],
  C: ['C', 'B'] as [string, string],
};

test('merge adds name and merge marker', t => {
  const merged$ = source$.pipe(merge(dependency1$, dependency2$));

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

    m.expect(alpha$.pipe(merge(bravo$))).toBeObservable(merged$);
  })
);

test('withLatestFrom adds name and combine marker', t => {
  const derived$ = source$.pipe(withLatestFrom(dependency1$, dependency2$));

  t.deepEqual(findMarker(derived$), {
    type: MarkerType.WITH_LATEST_FROM,
    sources: [source],
    dependencies: [dependency1, dependency2],
  });
});

test(
  'withLatestFrom emits on emit from source',
  marbles(m => {
    const alpha$ = m.hot('   a-c', letters);
    const bravo$ = m.hot('   -b-', letters);
    const combined$ = m.hot('--C', combined);

    m.expect(alpha$.pipe(withLatestFrom(bravo$))).toBeObservable(combined$);
  })
);

test('combineLatest adds name and merge marker', t => {
  const combined$ = source$.pipe(combineLatest(dependency1$, dependency2$));

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

    m.expect(alpha$.pipe(combineLatest(bravo$))).toBeObservable(combined$);
  })
);

test('startWith adds parent marker', t => {
  const startWith$ = source$.pipe(startWith(null));

  t.deepEqual(findMarker(startWith$), source);
});

test(
  'startWith emits',
  marbles(m => {
    const alpha$ = m.hot('    --c', letters);
    const startWith$ = m.hot('a-c', letters);

    m.expect(alpha$.pipe(startWith(letters.a))).toBeObservable(startWith$);
  })
);
