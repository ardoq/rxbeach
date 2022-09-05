 Roadmap
=========
> Updated as of 5th of September 2022

The purpose of this document is to clarify the goals, direction and upcoming tasks of RxBeach to make it simple for other developers to pick up tasks and implement new features. RxBeach is, as of writing this, suffering a bit by being the love child of one developer. This roadmap aims to make it easier for other
developers to pick up features, without breaking the style of the project, or going against the existing plans for the framework.

## Goals
This list is not prioritized nor exhaustive but gives an idea of what RxBeach
should be
 - Provide a developer-friendly interface for dealing with application state as
   streams
 - Prevent bugs, by having strict typings
 - Have a coherent design where the different pieces fit well together
 - Make it unnecessary for applications to implement much stream tooling of their
   own (Eg. applications should not need to bring their own stream tooling)

## Main features
The following features have already been implemented.
 - Action (creator) definitions
 - Routine definitions and subscriptions
 - Namespacing of actions

These are features we would like to have but haven't implemented yet. If you would like to take a crack at any of them, ping Tobias Laundal.
 - Uniqueness check of action types
 - Test scaffolding
 - Debug utils and making sure the framework is debuggable

## Implementation consideration
So far everything has been implemented as functional as possible and as composable as possible. This means the functions are mostly very small, we have preferred to have different functions, rather than accepting options that change
their behavior. This makes it easier to ensure the different pieces fit
together well, and the documentation for each function simpler.

We have also try to keep the library state free, where possible. Some of the
exceptions are the `action$`, `defaultErrorSubject` and `streamRegistry`. When
implementing new features, we should try to avoid introducing new state, unless
necessary.
