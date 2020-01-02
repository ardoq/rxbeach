import test from 'ava';
import { Observable } from 'rxjs';
import {
  findMarker,
  MarkerType,
  markOfType,
  actionMarker,
  markName,
  markCombineLatest,
  markWithLatestFrom,
  NameMarker,
  detectGlitch,
  Marker,
} from 'rxbeach/internal/markers';
import { tap, map } from 'rxjs/operators';
import { derivedStream } from 'rxbeach';
import { withLatestFrom } from 'rxbeach/operators';

const source$ = new Observable<unknown>().pipe(markName('source'));
const TOP_MARKER: NameMarker = {
  type: MarkerType.NAME,
  name: 'source',
  sources: [null],
};

test('actionMarker creates actionMarker', t => {
  t.deepEqual(actionMarker('heyo'), {
    type: MarkerType.ACTION,
    name: 'heyo',
  });
});

test('markName marks name', t => {
  t.deepEqual(findMarker(source$), TOP_MARKER);
});

test('markName includes parent marker', t => {
  const piped$ = source$.pipe(markName('piped'));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.NAME,
    name: 'piped',
    sources: [TOP_MARKER],
  });
});

test('markOfType marks action dependencies', t => {
  const piped$ = source$.pipe(
    markOfType([actionMarker('alpha'), actionMarker('bravo')])
  );

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.OF_TYPE,
    sources: [
      {
        type: MarkerType.ACTION,
        name: 'alpha',
      },
      {
        type: MarkerType.ACTION,
        name: 'bravo',
      },
    ],
  });
});

test('combineMarker includes names of parents', t => {
  const alpha$ = source$.pipe(markName('alpha'));
  const bravo$ = source$.pipe(markName('bravo'));
  const piped$ = source$.pipe(markCombineLatest([alpha$, bravo$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.COMBINE_LATEST,
    sources: [
      {
        type: MarkerType.NAME,
        name: 'alpha',
        sources: [TOP_MARKER],
      },
      {
        type: MarkerType.NAME,
        name: 'bravo',
        sources: [TOP_MARKER],
      },
    ],
  });
});

test('injectMarker includes names of source and dependencies', t => {
  const dependency$ = source$.pipe(markName('dependency'));
  const piped$ = source$.pipe(markWithLatestFrom(source$, [dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.WITH_LATEST_FROM,
    sources: [TOP_MARKER],
    dependencies: [
      {
        type: MarkerType.NAME,
        name: 'dependency',
        sources: [TOP_MARKER],
      },
    ],
  });
});

test('findMarker finds marker when before tap operator', t => {
  const piped$ = source$.pipe(tap(() => null));

  t.deepEqual(findMarker(piped$), TOP_MARKER);
});

test('findMarker finds marker when before tap and map operators', t => {
  const piped$ = source$.pipe(
    tap(() => null),
    map(() => null)
  );

  t.deepEqual(findMarker(piped$), TOP_MARKER);
});

// remote  source
//   |     / \
//    \   B   C
//     \ / \ /
//      F  D|E
const remote$ = new Observable<unknown>().pipe(markName('remote'));
const bravo$ = source$.pipe(markName('B'));
const charlie$ = source$.pipe(markName('C'));
const delta$ = derivedStream('D', bravo$, charlie$);
const echo$ = bravo$.pipe(withLatestFrom(charlie$), markName('E'));
const foxtrot$ = derivedStream('F', bravo$, remote$);

const source = TOP_MARKER;
const bravo = {
  type: MarkerType.NAME,
  name: 'B',
  sources: [source],
};
const charlie = {
  type: MarkerType.NAME,
  name: 'C',
  sources: [source],
};
const delta = {
  type: MarkerType.NAME,
  name: 'D',
  sources: [
    {
      type: MarkerType.COMBINE_LATEST,
      sources: [bravo, charlie],
    },
  ],
};
const echo = {
  type: MarkerType.NAME,
  name: 'E',
  sources: [
    {
      type: MarkerType.WITH_LATEST_FROM,
      sources: [bravo],
      dependencies: [charlie],
    },
  ],
};

test('detectGlitch detects glitches from derivedStream', t => {
  t.deepEqual(detectGlitch(findMarker(delta$) as Marker), [
    [delta, delta.sources[0], bravo, source],
    [delta, delta.sources[0], charlie, source],
  ] as [Marker[], Marker[]]);
});

test('detectGlitch detects glitches from withLatestFrom', t => {
  t.deepEqual(detectGlitch(findMarker(echo$) as Marker), [
    [echo, echo.sources[0], bravo, source],
    [echo, echo.sources[0], charlie, source],
  ] as [Marker[], Marker[]]);
});

test('detectGlitches does not detect false glitches', t => {
  t.false(detectGlitch(findMarker(foxtrot$) as Marker));
});

test('detectGlitches does not detect anything on marker without parent', t => {
  t.false(detectGlitch(actionMarker('asdf')));
  // The following test hit's the branch in detectGlitch when sources is
  // undefined, which is not actually possible in practice, hence the INVALID
  // marker type
  t.false(
    detectGlitch({
      type: MarkerType.INVALID,
      dependencies: [],
    })
  );
});
