# Ardoq Actions

> Stream architecture patterns for Ardoq

Welcome to the documentation for the Ardoq stream architecture. This
documentation mainly cover the concepts and patterns we are using, along with
some recipes and techniques for concrete examples of their usage. Throught the
documentation we are using the architecture utilities and scaffolding provided
alongside this documentation.

## Prerequisite knowledge

Before you dive into this documentation, and start working on tasks in
`ardoq-front` that deals with the architecture, you should have a good
understanding of the following:

1. The Model - ViewModel - View pattern
2. Observables and streams
3. Actions / Flux standard action / Redux

We recommend these articles to get a refresher on those subjects:

1. TODO

## Some general remarks about the `ardoq-front` codebase

- The codebase has gone through many stages, and there is legacy code
- A lot of "not legacy" code is also messy
- We do not do reactive programming in a comprehensive way
  - We have a stream based architecture, and some streaming functions and
    operators, but the majority of the code is not reactive, even the new code
    we write

## Diving in

The side bar contains all the documentation articles. We advice you read through
all the articles under "Fundamentals" in the order they are listed, and then
read the articles under "Recipes" and "Techniques" as you need them.
