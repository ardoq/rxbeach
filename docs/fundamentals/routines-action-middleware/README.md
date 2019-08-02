# Routines, Epics and Sagas

This section describes routines, epics and sagas.

## Technical details

- Routines - Accepts actions and performs side effects
- Epics - Accepts actions and emits actions
- Sagas - Takes any application state (actions, data streams, etc) and emits actions

## Intent of each

- Routine - Perform a specific side effect
- Epic - Multiplex an action
- Saga - Provide extra context for invoking another action

## Corresponding actions

Of routines, epics and sagas, all sagas and routines will have corresponding
action creators. This means that it is impossible to define a saga or routine
without an action also being defined.
