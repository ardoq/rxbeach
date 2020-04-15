import test, { Macro } from 'ava';
import { Observable, OperatorFunction, pipe, noop, empty } from 'rxjs';
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
  markMerge,
  markZip,
  markView,
  markRoutine,
} from './markers';
import {
  tap,
  map,
  catchError,
  shareReplay,
  scan,
  filter,
  debounceTime,
  pluck,
} from 'rxjs/operators';
import { derivedStream } from '../derivedStream';
import { withLatestFrom } from '../operators/decorated';

const source$ = new Observable<unknown>().pipe(markName('source'));
const dependency$ = source$.pipe(markName('dependency'));
const TOP_MARKER: NameMarker = {
  type: MarkerType.NAME,
  name: 'source',
  sources: [null],
};
const dependency: NameMarker = {
  type: MarkerType.NAME,
  name: 'dependency',
  sources: [TOP_MARKER],
};

test('actionMarker creates actionMarker', (t) => {
  t.deepEqual(actionMarker('heyo'), {
    type: MarkerType.ACTION,
    name: 'heyo',
  });
});

test('markName marks name', (t) => {
  t.deepEqual(findMarker(source$), TOP_MARKER);
});

test('markName includes parent marker', (t) => {
  const piped$ = source$.pipe(markName('piped'));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.NAME,
    name: 'piped',
    sources: [TOP_MARKER],
  });
});

test('markRoutine includes parent marker', (t) => {
  const piped$ = source$.pipe(markRoutine());

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.ROUTINE,
    sources: [TOP_MARKER],
  });
});

test('markView includes name and parent marker', (t) => {
  const piped$ = source$.pipe(markView('piped'));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.VIEW,
    name: 'piped',
    sources: [TOP_MARKER],
  });
});

test('markOfType marks action dependencies', (t) => {
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

test('markCombineLatest includes sources', (t) => {
  const alpha$ = source$.pipe(markName('alpha'));
  const piped$ = source$.pipe(markCombineLatest([alpha$, dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.COMBINE_LATEST,
    sources: [
      {
        type: MarkerType.NAME,
        name: 'alpha',
        sources: [TOP_MARKER],
      },
      dependency,
    ],
  });
});

test('markWithLatestFrom includes source and dependencies', (t) => {
  const piped$ = source$.pipe(markWithLatestFrom(source$, [dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.WITH_LATEST_FROM,
    sources: [TOP_MARKER],
    dependencies: [dependency],
  });
});

test('markMerge includes sources', (t) => {
  const piped$ = source$.pipe(markMerge([source$, dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.MERGE,
    sources: [TOP_MARKER, dependency],
  });
});

test('markZip includes sources', (t) => {
  const piped$ = source$.pipe(markZip([source$, dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.ZIP,
    sources: [TOP_MARKER, dependency],
  });
});

const findMarkerOver: Macro<[OperatorFunction<any, any>]> = (t, operator) =>
  t.deepEqual(findMarker(source$.pipe(operator)), TOP_MARKER);
findMarkerOver.title = (name) =>
  `findMarker finds marker over ${name} operator`;

const coop = () => true;
const emop = () => empty();
test('debounceTime', findMarkerOver, debounceTime(0));
test('filter', findMarkerOver, filter(coop));
test('scan', findMarkerOver, scan(coop));
test('shareReplay', findMarkerOver, shareReplay());
test('catchError', findMarkerOver, catchError(emop));
test('tap and map', findMarkerOver, pipe(tap(coop), map(coop)));
test('tap', findMarkerOver, tap(noop));
test('map', findMarkerOver, map(coop));
test('pluck', findMarkerOver, pluck('key'));

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

test('detectGlitch detects glitches from derivedStream', (t) => {
  t.deepEqual(detectGlitch(findMarker(delta$) as Marker), [
    [delta, delta.sources[0], bravo, source],
    [delta, delta.sources[0], charlie, source],
  ] as [Marker[], Marker[]]);
});

test('detectGlitch detects glitches from withLatestFrom', (t) => {
  t.deepEqual(detectGlitch(findMarker(echo$) as Marker), [
    [echo, echo.sources[0], bravo, source],
    [echo, echo.sources[0], charlie, source],
  ] as [Marker[], Marker[]]);
});

test('detectGlitches does not detect false glitches', (t) => {
  t.false(detectGlitch(findMarker(foxtrot$) as Marker));
});

test('detectGlitches does not detect anything on marker without parent', (t) => {
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
