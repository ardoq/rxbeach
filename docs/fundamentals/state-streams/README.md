# State streams

In RxBeach, the application state is contained within multiple state streams that emit a subset of the application state over time. In the code and function names, state streams are often refered to as "persistent streams".

All state streams have the following properties:

- They replay previous values to new subscribers
- They are multicast. This means that all subscribers will "share" one subscription to the state stream.
- They always start with a value. This ensures that state streams resolve immediately.

## Types of state streams
In RxBeach we have mainly two types of state streams:
 1. Streams that are created by reducing over the action stream (`persistentReducedStream` in the code)
 2. Everything else (`persistentDerivedStream` in the code)

The first type is usually the most useful, while the second types allows us to use any observable as a state stream. So when should we use a derived stream over a reduced stream? Here are two heuristics to guide you:
 - If the stream doesn't contain any state, it should likely be a derived stream
 - If the stream is not triggered by actions, it should likely be a derived stream

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
