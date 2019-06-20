import {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload
} from "./ActionCreator";
import debug from "./debug";

export class ActionRegistry {
  actionTypes: Set<string>;

  constructor() {
    this.actionTypes = new Set();
  }

  /**
   * Create an action creator
   *
   * ```
   * action('[core] my action').noPayload;
   * action('[core] my action with payload').payload<Payload>();
   * ```
   *
   * @throws Error if an action of the type already exists
   * @param type The type name of the action
   */
  action<Type extends string>(type: Type) {
    this._verifyType(type);

    return this._createActionCreator(type);
  }

  _verifyType(type: string) {
    if (this.actionTypes.has(type)) {
      throw new Error("Double action registration");
    }

    this.actionTypes.add(type);
  }

  _createActionCreator<Type extends string>(type: Type) {
    const noPayload: ActionCreatorWithoutPayload<Type> = () => ({
      type,
      meta: debug.createMeta()
    });
    noPayload.type = type;

    const payload = <Payload>(): ActionCreatorWithPayload<Type, Payload> => {
      const action: ActionCreatorWithPayload<Type, Payload> = payload => ({
        ...noPayload(),
        payload
      });
      action.type = type;

      return action;
    };

    return {
      /**
       * Create an action creator with a payload of type Payload
       *
       * @template Payload The type of the payload
       */
      payload,
      /**
       * An action creator that does not take a payload
       */
      noPayload
    };
  }
}

export const actionRegistry = new ActionRegistry();

export default actionRegistry.action;
