import { defaultErrorSubject } from '../defaultErrorSubject';
import { Subject } from 'rxjs';

const PERFORMANCE_MARK_PREFIX = 'rxbeach';

const isWindowPerformanceDefined = () =>
  typeof window !== 'undefined' && window.performance;

const getPerformanceMarker = (name: string) => {
  return `${PERFORMANCE_MARK_PREFIX} - ${name}`;
};

const getStartMarker = (marker: string) => `${marker} - start`;
const getEndMarker = (marker: string) => `${marker} - end`;

export const startPerformanceMeasurement = (
  name: string,
  errorSubject: Subject<any> = defaultErrorSubject
) => {
  if (!isWindowPerformanceDefined()) return;
  try {
    const marker = getStartMarker(getPerformanceMarker(name));
    window.performance.mark(marker);
  } catch (e) {
    errorSubject.next(e);
  }
};

export const endPerformanceMeasurement = (
  name: string,
  errorSubject: Subject<any> = defaultErrorSubject
) => {
  if (!isWindowPerformanceDefined()) return;
  const marker = getPerformanceMarker(name);
  const startMarker = getStartMarker(marker);
  const endMarker = getEndMarker(marker);
  try {
    window.performance.mark(endMarker);
    window.performance.measure(marker, startMarker, endMarker);
  } catch (e) {
    errorSubject.next(e);
  }
};
