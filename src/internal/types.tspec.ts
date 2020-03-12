import { Has, AssertFalse } from 'conditional-type-checks';
import { ActionWithoutPayload, ActionWithPayload } from '../types/Action';
import {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from '../types/ActionCreator';
import {
  UnknownAction,
  UnknownActionCreator,
  UnknownActionCreatorWithPayload,
} from './types';

const any = undefined as any;
const actionWithPayload = any as ActionWithPayload<any>;
const actionWithoutPayload = any as ActionWithoutPayload;
const actionCreatorWithoutPayload = any as ActionCreatorWithoutPayload;
let actionCreatorWithPayload = any as ActionCreatorWithPayload<any>;

let unknownAction: UnknownAction;
let unknownActionCreatorWithPayload: UnknownActionCreatorWithPayload<unknown>;
let unknownActionCreator: UnknownActionCreator;

// ActionWithPayload and ActionWithoutPayload is assignable to UnknownAction
unknownAction = actionWithoutPayload;
unknownAction = actionWithPayload;

type ActionCreatorWithoutPayload_is_not_assibleable_to_UnknownActionCreatorWithPayload = AssertFalse<
  Has<ActionCreatorWithoutPayload, UnknownActionCreatorWithPayload<unknown>>
>;

// ActionCreatorWithPayload and UnkownActionCreatorWithPayload is assignable to each other
unknownActionCreatorWithPayload = actionCreatorWithPayload;
actionCreatorWithPayload = unknownActionCreatorWithPayload;

unknownActionCreator = actionCreatorWithPayload;
unknownActionCreator = actionCreatorWithoutPayload;
