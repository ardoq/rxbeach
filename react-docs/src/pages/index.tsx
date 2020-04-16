import GettingStarted from './GettingStarted';
import Examples from './Examples';
import { Page, PageGroup } from '../types';
import Actions from './Actions';
import Views from './Views';
import Routines from './Routines';
import State from './State';

const pages: (Page | PageGroup)[] = [
  GettingStarted,
  Actions,
  State,
  Views,
  Routines,
  Examples,
];

export default pages;
