import { OperatorFunction, pipe } from 'rxjs';
import { ignoreElements } from 'rxjs/operators';
import { MultiActionOperator } from 'stream-patterns/actionOperators';
import { Action, VoidPayload } from 'stream-patterns/types/Action';
import { ActionCreator } from 'stream-patterns/types/ActionCreator';

/**
 * Define a routine hooked onto existing actions
 *
 * This type of routine should be used to add more functionality to existing
 * actions, preferably actions intended to be used as events.
 *
 * You are adviced to not pull other streams into a hooked routine, but rather
 * make the hooked routine invoke an action routine that pulls in the other
 * streams. This gives better separation of concerns.
 *
 * @param operator The routine itself, a simple operator that accepts actions
 * @param actions The actions to accept
 * @template `Payload` - The type of payload on the action creators
 */
export const hookRoutine = <Payload = VoidPayload>(
  operator: OperatorFunction<Action<Payload>, unknown>,
  ...actions: ActionCreator<Payload>[]
): MultiActionOperator<Action<Payload>> => ({
  types: actions.map(({ type }) => type),
  operator: pipe(
    operator,
    ignoreElements()
  ),
});
