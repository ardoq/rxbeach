import { Subject } from 'rxjs';
import { rethrowErrorGlobally } from './rethrowErrorGlobally';

/**
 * The default error subject is where errors that RxBeach has silenced will go
 * if no other error subjects are specified.
 *
 * This subject is by default subscribed so that all the erros that it emits are
 * rethrown globally, with `rethrowErrorGlobally`
 *
 * @see rethrowErrorGlobally
 */
export const defaultErrorSubject = new Subject<any>();

defaultErrorSubject.subscribe(error => rethrowErrorGlobally(error));
