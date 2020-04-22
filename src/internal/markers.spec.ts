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
  markMerge,
  markZip,
  markDebounceTime,
} from './markers';
import {
  tap,
  map,
  catchError,
  shareReplay,
  scan,
  filter,
  pluck,
} from 'rxjs/operators';

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

test('markDebounceTime includes source', (t) => {
  const piped$ = source$.pipe(markDebounceTime(source$, 0));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.DEBOUNCE_TIME,
    sources: [TOP_MARKER],
    time: 0,
  });
});

const findMarkerOver: Macro<[OperatorFunction<any, any>]> = (t, operator) =>
  t.deepEqual(findMarker(source$.pipe(operator)), TOP_MARKER);
findMarkerOver.title = (name) =>
  `findMarker finds marker over ${name} operator`;

const coop = () => true;
const emop = () => empty();
test('filter', findMarkerOver, filter(coop));
test('scan', findMarkerOver, scan(coop));
test('shareReplay', findMarkerOver, shareReplay());
test('catchError', findMarkerOver, catchError(emop));
test('tap and map', findMarkerOver, pipe(tap(coop), map(coop)));
test('tap', findMarkerOver, tap(noop));
test('map', findMarkerOver, map(coop));
test('pluck', findMarkerOver, pluck('key'));
