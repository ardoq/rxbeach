# Routines

Routines are how we communicate from the world of streams and actions to
everything else. Routines hook into the action stream, and can from there use
any stream operator to do what is needed.

Routines are for example used to:

- Call the backend
- Call non-stream methods like stuff in Backbone, updating the window title, etc
- Invoke multiple other actions from one action

## Routine tooling

Ardoq actions has two utility functions to create routines

- `actionRoutine`
- `hookRoutine`

The only difference between these two is that action routines also define an
action, and should use this action to trigger logic, while the hook routines are
hooked onto existing actions.

### Action routines

Much like the reducers (action reducers), the action routines are definitions of
both the routines and the actions that trigger the routines. Action routines are
preferred over hook routines, because they are more explicit and reusable,
because they are not reliant on other action definitions.

Here is a short code example of an action routine that prints a message to the
browser console:

```typescript
import { actionRoutine } from "stream-patterns/routines/actionRoutine";
import { extractPayload } from "stream-patterns/utils/operators";

const logToConsole = actionRoutine<string>(
  "[debug] log to console",
  pipe(
    extractPayload(),
    tap(message => console.log(message))
  )
);

// When `logToConsole` is registered on the action stream, the following line
// will invoke the routine
dispatchAction(logToConsole("Hello World!"));
```

### Hook routines

Unlike the action routines, the hook routines are not definitions of actions.
Instead, they take a list of actions to listen to when they are defined. When
either of these actions are dispatched on the action stream, the routine will
execute.

The main use for hook routines is doing inversion of control by events or other
notification systems. This means that hook routines should be used to listen
for event actions and then invoke other reducers or action routines.

Here is a short example that hooks into the `logToConsole` action routine above
and prints the length of the message to the browser console:

```typescript
import { hookRoutine } from "stream-patterns/routines/hookRoutine";

const logMessageLength = hookRoutine(
  pipe(
    extractPayload(),
    map(message => message.length),
    tap(length => console.log("Message length:", length))
  ),
  logToConsole
);

// When `logMessageLength` is registered on the action stream, the routine will
// be invoked whenever the `logToConsole` action is invoked
```

## Registering routines

Routines must be "registered" on the action stream in order to have any effect.
This registration is actually piping the action stream through the stream
operator defined by `hookRoutine` or `actionRoutine`, and subscribing to the
resulting observable.

The utility functions `combineActionOperators` and `registerActionOperators`
does the heavy lifting for us. The combine util takes multiple routines, and
returns a single operator function that invokes the correct routines for each
action it accepts. The register util takes a streaming operator that accepts
actions (like the one returned by the combine util), and subscribes it to an
action stream.

Here is an example registration of the two routines above:

```typescript
import {
  combineActionOperators,
  registerActionOperators
} from "stream-patterns/actionOperators";

const routines = combineActionOperators(logToConsole, logMessageLength);
registerActionOperators(action$, routines);

dispatchAction(logToConsole("Hello World!"));
// Console would now print
// > Hello World!
// > Message length: 12
```

## Routine patterns

Routines are a very powerful tool, that can both be used and abused. When
writing routines you should be aware of some patterns that should be used, both
to get you started, and to make sure other developers can easily understand your
code.

We have identified three main patters for routines, that we think cover all use
cases, while being explicit and familiar. The three patterns are as follows:

- Pure routine
  - Used for simple, concrete side effects, do not invoke other actions
- Context routine
  - Used to provide data to other actions, or invoke other actions at the
    correct time
- Multiplex routine
  - Used to connect existing actions to other actions

After reading about each of these patterns, you might notice that the example of
a hook routine above does not follow any of them. It seems to be a mix of a pure
routine and a multiplex routine. A more correct implementation of the examples
above, can be found [here](https://github.com/ardoq/ardoq-actions/tree/master/src/examples/routines).

### Pure routine

A pure routine is used to perform simple side effects. It does one thing, and
doesn't care about the outcome. It should be the termination of a branch in the
action stream tree. Because of the concise nature of a pure routine, it should
be an action routine.

Rules for pure routines:

- Does not emit anything
- Does not pull in other streams (`combineLatest`, `withLatest`, `merge`,
  `switchMap`, etc...)
- Has its own, exclusive action (it should be an action routine)

Examples:

- Use browser api, like setting window title, open link, spawn window
- Call backend endpoints where the response doesn't matter: tracking, for
  instance
- Modify global mutable state, like Backbone

### Context routine

A context routine provides some sort of context to other actions. The context
might be data that is pulled from other streams, or order or temporal context by
invoking other actions at the correct time. In order to separate the _what_ from
the _when_, context routines should be action routines.

Rules for context routines:

- _Emits_[<sup>1</sup>](#Footnotes) other actions
- Only performs side effects when needed in order to get the correct context
- May pull in other streams
- May emit other actions at will, independently of when it's own action is
  dispatched
- Has its own, exclusive action (it should be an action routine)

Examples:

- Perform CRUD api calls, and dispatch actions to update local collections
- Perform api calls, and dispatch actions to indicate success or failure
- Provide the latest value of a stream to another action
- Debounce actions

### Multiplex routine

A multiplex routine is used to connect existing actions together to achieve
inversion of control, for example with event or notification actions. This
makes it possible for callsites to not list every single action that should
happen when a generic change occurs.

Rules for multiplex routines:

- _Emits_[<sup>1</sup>](#footnotes) other actions
- Does not perform any side effects, except for emitting actions
- Does not pull in other streams (`combineLatest`, `withLatest`, `merge`,
  `switchMap`, etc...)

Examples:

- Hook tracking routines onto other actions
- Reset a view when new components are fetched
- Perform cleanup when navigating away from a view

### The `tap(dispatchAction)` trick

For routines that should emit events, you should not call `dispatchAction`
manually in the pipe. Instead, you are adviced to make your pipe end by emitting
actions, and adding `tap(dispatchAction)` as the last step. You might need to
use `flatMap` to make sure the pipe emits one action at a time, instead of an
array of actions. The
[data collection example](https://github.com/ardoq/ardoq-actions/tree/master/src/examples/data-collection)
is a good reference for this pattern.

#### Footnotes

1. No routine can actually emit anything in the stream pipe sense, as
   `ignoreElements` is applied to all `actionRoutines` and `hookRoutines`.
   Routines that should _emit_ other actions, do in fact have to dispatch them
   themselves, but it is recommended to do it like described in [The
   `tap(dispatchAction)` trick](#the-tapdispatchaction-trick)
