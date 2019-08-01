import { Routine, RoutineSet } from "../src/routines";
import { ActionDispatcher } from "../src/types";
import { pipe } from "rxjs";

const myRoutine: Routine = (dispatchAction: ActionDispatcher) => pipe(); // Pipe input is actions

export const routines: RoutineSet = new Set([myRoutine]);
