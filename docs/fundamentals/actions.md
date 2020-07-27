# Actions and the action stream

At the core of our stream architecture sits the actions and the action stream.
All changes to the core data stores, view models and any side effect from the
application is triggered by actions. They are immutable packets of information
that describe a change or an event.

Technically, actions are simple javascript objects of a specific shape, and the
action stream is an RXJs [Subject](https://rxjs.dev/guide/subject), where each
new action is `next`ed by the use of a `dispatchAction` function.

## Actions

The action objects have these fields:

- `type` - An action type
- `meta` - Some meta data
- `payload` - An optional payload

They can look something like this:

```typescript
const action = {
  type: Symbol("[navigation] show module"),
  payload: Module.DASHBOARD,
  meta: {
    dispatchedAt: new Date(),
    dispatchedBy: new Error()
  }
};
```

This example may describe the navigation to a new module in an application.

## Action creators

In actual usage we would never spell out such an action object ourselves.
Instead we define action creators, that hold the type and name of the payload.
Sometimes we refer to these action creators as just "actions".

An action creator for the action above could be created by:

```typescript
enum Module {
  DASHBOARD
}
const showModule = actionCreator<Module>("[navigation] show module");
```

`showModule` is now an action creator. Specifically it can be called with the
payload as the only argument, and will return an action object.

```typescript
showModule(Module.DASHBOARD);
```

## Payloads

Care should be taken when designing the shape of an action payload. In the above
example the payload is a simple enum, but there will be cases where more 
complex structures are needed.

### Actions should describe *what* is happening

We recommend trying to treat actions more as "describing events that occurred",
rather than "setters". Treating actions as "events" generally leads to more
meaningful action names, fewer total actions being dispatched, and a more
meaningful action log history. Writing "setters" often results in too many
individual action types, too many dispatches, and an action log that is less
meaningful.

Furthermore, "describing events that occurred" can prevent coupling between
modules. A module should know how to describe an event that happens through an
action, but it shouldn't care about how that action is executed (i.e. a certain
order of action setters).

#### Batch actions

If you find code that calls the same action multiple times right after each
other, the payload is badly designed. This is a symptom that the callsite tries
to use the actions as instructions for how the app should transition its state,
rather than telling the app what the change is. In these cases, the payload 
should be designed so it can contain, for example, changes to multiple entities
at once.

### Payloads should be concise, avoid passing unnecessary information

Actions should describe what's happening by passing as little information as
possible. This is in order to ensure that handlers of the actions are reading
data from the correct source of truth.

In practice, this means that you should always to aim pass ids instead of whole
objects in action payloads. If an action handler needs the whole object, it
should read that from the single source of truth (i.e. from the application
state).

### Payloads should be serializable

Payloads should not contain methods, instances of classes or views. You should
always aim to pass the data that's required to describe the action and nothing
more.

> **What about callbacks?**
> If you need to describe what should happen after an
> action, describe it with data. This ensures less coupling between different
> modules. The caller only cares about describing what should happen, while the
> handler of the action will care about how it should happen.

## The action stream

For actions to actually make something happen, the whole app needs to know about
them. This is the job of the action stream. Everywhere we need to react to actions
in the app, we add subscriptions to the action stream. When we have created an
action, we dispatch it to the action stream so all the subscribers will be 
notified.

The action stream will usually be named `action$`. New actions will usually be
dispatched with a function named `dispatchAction`.

> **RxBeach does not have tooling for creating the `action$`**
> RxBeach does currently not have tooling to create the `action$` stream and the
> `dispatchAction` function. This will be added eventually

The action stream feeds most other streams in the app by being reduced to
different kind of state, like a ViewModel or a collection. 
