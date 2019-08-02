# Actions and the action stream

At the core of our stream architecture sits the actions and the action stream.

All changes to the core data stores, view models and any side effect from the
application is triggered by actions.

Actions are simple objects of a specific shape, and the action stream is an RXJs
[Subject](https://rxjs.dev/guide/subject) where each new action is `next`ed by
the use of a `dispatchAction` function.

## Actions

Actions are objects with:

- An action type
- Some meta data
- An optional payload

They can look something like this:

```javascript
const action = {
  type: Symbol("[counter] increment"),
  payload: {
    increment: 3
  },
  meta: {
    dispatchedAt: new Date(),
    dispatchedBy: new Error()
  }
};
```

This example describes an action that will increment a counter by three.

In actual usage you would never write such an action object yourself, the only
thing "users" of the architecture provide is the payload and, indirectly, the
type. The action objects are created by action creator functions, sometimes
called "action types" or even just "actions". The action types are defined by
the help of utils.

The action types are defined as part of a reducer, part of a routine or as a
legacy action. They are defined one time each, as globals, and are then invoked
as functions in order to get an action object.

Given a reducer called `incrementCounter`, creating the action object example
above, would probably look something like this:

```javascript
incrementCounter({ increment: 3 });
```

### Payloads

Care should be taken when designing the shape of an action payload. There are
two very important rules regarding payloads:

- Payloads should contain as little information as possible
- Payloads should only contain pure data

Passing as little information as possible means for instance that:

- You should not pass full models of persisted data, prefer instead their ids
- Payloads should not contain "static" fields, if you can simplify a payload by
  splitting it in multiple actions, do that

By pure data we mean primitives, and objects and arrays of primitives. This
means that functions, class instances and views are no-gos.

> **What about callbacks?**
>
> If you think you need callbacks, you should create some data shape that
> describes what should happend after the action is dispatched, and add that to
> the payload

## The action stream

The action stream, called `action$` in our code, is the backbone of our data
architecture. It ties everything together by being the single source of truth
for any changes that happen in the app.

The action stream feeds most other streams in the app by being reduced to
different kind of state, like a ViewModel or a collection.
