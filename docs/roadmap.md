 Roadmap
=========
> Updated as of 6th of Januar 2020

The purpose of this document is to clarify the goals, direction and upcoming tasks of RxBeach to make it simple for other developers to pick up tasks and implement new features. RxBeach is, as of writing this, suffering a bit by being the love child of one developer. This roadmap aims to make it easier for other
developers to pick up features, without breaking the style of the project or
going against the existing plans for the framework.

## Goals
This list is not prioritized nor exhaustive but gives an idea of what RxBeach
should be
 - Provide a developer-friendly interface for dealing with application state as
   streams
 - Prevent bugs, by having strict typings
 - Have a coherent design where the different pieces fit well together
 - Make it unnecessary for applications to implement much stream tooling of their
   own (Eg. stream related utils in `ardoq-front` should be deprecated in favor
   of equivalent utilities in RxBeach)

## Main features
The following features have already been implemented, though nothing is
considered completely stable yet.
 - Action (creator) definitions
 - Routine definitions and subscriptions
 - Namespacing of actions
 - Detection of possible glitches and mapping of streams

These are features we would like to have but haven't implemented yet. If you
would like to take a crack at any of them, ping Tobias Laundal.
 - Reducing actions to a state
 - State streams that are hot, with replay and name
 - Derived streams from other streams
 - Subscribing React views to streams
 - Serializing
 - Uniqueness check of action types
 - Test scaffolding
 - Debug utils and making sure the framework is debuggable

## Implementation consideration
So far everything has been implemented as functional as possible and as
composable as possible. This means the functions are mostly very small, we have
preferred to have different functions, rather than accepting options that change
their behavior. This makes it easier to ensure the different pieces fit
together well, and the documentation for each function simpler.

We have also, almost, managed to make the library itself be state free. The only
exception is `defaultErrorSubject`. This has been a more or less conscious
decision, so please consider and reconsider if you think about adding a feature
by introducing state in the framework.

## Specs
Here follows a short list of specs for some of the upcoming features. The specs
are not comprehensive.

### Reducing actions to state
 - Strict typing between state type, payload type of action, and argument types
   of reducers
 - Define a single reducer for multiple actions at once
 - Declarations of what actions a reducer belongs to should be close to the
   reducer
 - Implemented as a stream operator, to allow for advanced uses

### State streams and Derived streams
 - Should be implemented as composable as possible, probably as stream operators,
   and then maybe with some util functions to "kickstart" them
 - Need to figure out how to deal with namespaced state streams

### Subscribing react views to streams
 - Functional first, with hook
 - Strictly typed HOC
 - Needs to create instances of namespaced state streams

### Serializing
 - Motivation is to support child windows, serializing the app state, maybe have
   common stream on backend and frontend
