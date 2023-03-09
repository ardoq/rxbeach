import { derivedStream } from './derivedStream';
import { marbles } from 'rxjs-marbles/jest';

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
