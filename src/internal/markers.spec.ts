import test from 'ava';
import { Observable } from 'rxjs';
import {
  findMarker,
  MarkerType,
  markOfType,
  actionMarker,
  markName,
  markCombine,
  markWithLatest,
  NameMarker,
} from 'rxbeach/internal/markers';
import { tap, map } from 'rxjs/operators';

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
  const piped$ = source$.pipe(markCombine([alpha$, bravo$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.COMBINE,
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
  const piped$ = source$.pipe(markWithLatest(source$, [dependency$]));

  t.deepEqual(findMarker(piped$), {
    type: MarkerType.WITH_LATEST,
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
