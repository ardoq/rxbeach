# Preventing glitches

## Introduction (the Diamond Problem)

Because we don't have a single store in an RxBeach application and state streams
can depend on each other, an application is prone to glitches (also known as the
diamond problem).

The diamond problem occurs in observables when a destination observable
subscribes to multiple observables which in turn subscribe to the same root
observable. When the shared root pushes a new value, the destination observable
will push two new values in quick succession. This can result in double
calculations and flickering UI.

As Andre Staltz outlines in [his article on
glitches](https://staltz.com/rx-glitches-arent-actually-a-problem.html), we
cannot prevent glitches in the above scenario with RxJs, since it would require
a transaction manager under the hood. Nevertheless, he goes on to conclude that
glitches aren't really a problem, since they can be avoided by combining your
streams differently (i.e. by proper software design).

## Avoiding glitches in RxBeach

In RxBeach glitches can happen in derived state streams. If we combine two or
more streams that emit from the same root source, we will encounter a glitch in
the derived stream (it will emit once for each base stream emission).

There are two main strategies for avoiding glitches in an RxBeach state
graph. As a guideline, you should aim to solve all glitches within your
state graph by applying the software design principles below, but when
encountering a glitch at the end of a reactive state graph you can use
`debounceTime` (i.e. in a `viewModel$` that is passed to a view).

### Avoid glitches by "software design"

In [his article on
glitches](https://staltz.com/rx-glitches-arent-actually-a-problem.html), André
Staltz concludes that glitches aren't really a problem because they can be
avoided by reasoning about how your reactive graph emits data and using the
right stream combination operators. We will refer to this approach as "avoiding
glitches by software design".

In an RxBeach application, you should follow these design principles to avoid
introducing glitches:

1. Keep your reactive state graph flat. Avoid creating unnecessary layers of derived state streams.
1. If you need to create a derived state stream, aim to augment the data so that subscribers of the derived state stream don't need to subscribe to the root stream.
3. Automatically visualize and detect glitches within your state streams so that
   you can handle them when they are introduced

Although the above principles will help you avoid some glitches, it doesn't
completely solve the problem. The `viewModel$` pattern suggests that we should
combine various state streams to prepare suitable props for a view. When
combining these streams, we have no information about whether the streams depend
on the same source, and since the requirements of a view change rapidly it is
likely that a glitch can be introduced. Consequently, it's not feasible to avoid
all glitches by software design.

### Avoid glitches by debouncing combined stream emissions

As long as the combined streams emit their values synchronously, introducing the
`debounceTime` operator will ensure that the stream only emits the "latest" value
in the current frame to its subscribers.

Adding `debounceTime` ensures that the subscriber will only be called once when
two or more combined streams emit simultaneously, but it will make the
subscription handler async.

One should be careful when introducing `debounceTime` in derived state streams that are combined multiple times further down the graph.
