import { OperatorFunction, pipe } from 'rxjs';

import { RoutineFunc } from './internal/routineFunc';
import { routinesRegistry } from './routinesRegistry';

export { Routine } from './internal/routineFunc';

/** *
 * A routine is simply a stream operator that will recieve actions, and is
 * supposed to perform side effects.
 * Routines are added to registery when they are created and subscribed by calling startRoutines when.
 */
export const routine: RoutineFunc = (...args: OperatorFunction<any, any>[]) => {
  const routine = pipe(...(args as [OperatorFunction<any, any>]));
  routinesRegistry.register(routine);
  return routine;
};
// TODO: Delete mergeOperators
