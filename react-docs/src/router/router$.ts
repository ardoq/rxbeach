import history from './history';
import { Subject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

type HistoryShape = {
  search: string;
};
const history$ = new Subject<HistoryShape>();

history.listen(location => {
  history$.next(location);
});

type RouterShape = {
  selectedPageId: string | null;
};

export const router$: Observable<RouterShape> = history$.pipe(
  startWith(history.location),
  map(({ search }) => {
    const urlParams = new URLSearchParams(search);
    return {
      selectedPageId: urlParams.get('p'),
    };
  }),
);

export const selectPage = (pageId: string) => {
  const urlParams = new URLSearchParams(history.location.search);
  urlParams.set('p', pageId);
  history.push({
    pathname: history.location.pathname,
    search: urlParams.toString(),
  });
};
