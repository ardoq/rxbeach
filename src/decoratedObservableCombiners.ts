import * as rxjs from 'rxjs';
import { Observable } from 'rxjs';
import { markMerge, markCombineLatest, markZip } from 'rxbeach/internal';

export const combineLatest = ((...sources: Observable<unknown>[]) =>
  rxjs
    .combineLatest(...sources)
    .pipe(markCombineLatest(sources))) as typeof rxjs.combineLatest;

export const merge = ((...sources: Observable<unknown>[]) =>
  rxjs.merge(...sources).pipe(markMerge(sources))) as typeof rxjs.merge;

export const zip = ((...sources: Observable<unknown>[]) =>
  rxjs.zip(...sources).pipe(markZip(sources))) as typeof rxjs.zip;
