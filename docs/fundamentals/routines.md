# Routines

Routines are how we communicate from the world of streams and actions to everything else. Routines hook into the action stream, and can from there use any stream operator to do what is needed.

Routines are for example used to:

- Call the backend
- Call non-stream methods like stuff in Backbone, updating the window title, etc
- Invoke multiple other actions from one action


## Defining routines

Routines are, at a technical level, just RxJs pipes. Let's take a look at an
example

```typescript
const logModuleChange = routine(
  ofType(showModule),
  extractPayload(),
  tap(module => console.log(`Showing module ${module}`))
);
```

To understand how this works, you can imagine the `routine` function call being replaced by `action$.pipe`. At the top, actions that are dispatched to the action stream will flow in, then `ofType` will filter for only actions of the `showModule` type. `ofType` also provides type hints for typescript.
`extractPayload` is a small helper that plucks the payload from the full action object. Most routines will include `extractPayload`, as we are usually not interested in other parts of the action object.

## Subscribing routines

Just defining the routine doesn't do anything. The routine has to be subscribed to the action stream. This can be done with the `subscribeRoutine` function.

```typescript
const subscription = subscribeRoutine(action$, logModuleChange)
```

If you are subscribing multiple routines, you should "collect" them before
passing them to `subscribeRoutine`:

```typescript
const routines = collectRoutines(logModuleChange, someRoutine, someOtherRoutine);
subscribeRoutine(action$, routines);
```

> **In Ardoq**
> Internal codebases at Ardoq have a `startRoutines` module that imports all
> routines, and starts them at the appropriate time.
