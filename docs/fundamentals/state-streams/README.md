# State streams

In RxBeach, the application state is contained within multiple state streams that emit a subset of the application state over time.

All state streams have the following properties:

- They replay previous values to new subscribers
- They are multicast. This means that all subscribers will "share" one subscription to the state stream.
- They always start with a value. This ensures that state streams resolve immediately.

## Design considerations

- Why multiple state streams?

  In contrast to Redux, an RxBeach application doesn't have a single store.
  The application state is spread across multiple state streams. Combined, all
  of the base streams represent the current application state (i.e. the single
  source of truth).

  Reasons: performance, decoupling, reselect
- Unidirectional data flow

  Although there are multiple state streams, the data generally flows in one direction in an RxBeach application. This property is broken if you use stream reducers.

  Actions --> Base State Streams --> Derived State Streams --> Views -->
  Actions
