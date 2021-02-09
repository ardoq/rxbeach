import { AssertFalse, AssertTrue, Has, IsExact } from 'conditional-type-checks';
import {
  ActionCreator,
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from './ActionCreator';
import { ActionCreatorCommon } from '../internal/types';

type ActionCreatorWithPayload_extends_ActionCreatorCommon = AssertTrue<
  Has<ActionCreatorWithPayload<unknown>, ActionCreatorCommon>
>;
type ActionCreatorWithoutPayload_extends_ActionCreatorCommon = AssertTrue<
  Has<ActionCreatorWithoutPayload, ActionCreatorCommon>
>;

type ActionCreator_dispatches_to_ActionCreatorWithPayload = AssertTrue<
  IsExact<ActionCreator<string>, ActionCreatorWithPayload<string>>
>;
type ActionCreator_dispatches_to_ActionCreatorWithoutPayload = AssertTrue<
  IsExact<ActionCreator, ActionCreatorWithoutPayload>
>;
