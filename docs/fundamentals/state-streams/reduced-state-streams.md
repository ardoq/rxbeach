# Reduced State Streams

A state stream can be defined with a set of reducers that calculate the
application state. This is how we make the application react to actions. The
action and reducers pattern is a form of functional programming and should make
the application state flow quite easy to follow.

A reducer is a function that receives the current stream state and something to
describe how the stream state should change. This something is usually an
action, but can also be another stream.

## Action reducers

Action reducers receive the stream state and an action payload and calculates
the next application stream. In RxBeach we define the action reducers with the
`reducer` function.

Reducers can handle both actions with and without payloads. Actions without payloads are usually just triggers of some kind.
Below is an example of both.

```typescript
import { actionCreator, reducer } from 'rxbeach';

type MyStreamState = { counter: 1 };
const increment = actionCreator('increment');
const incrementBy = actionCreator<number>('increment by');

const handleIncrement = reducer(
  increment,
  ({ counter }: MyStreamState) => ({ counter: counter + 1 })
);
const handleIncrementBy = reducer(
  incrementBy,
  ({ counter }: MyStreamState, count) => ({ counter: counter + count})
)
```

Notice the typings here. TypeScript can infer the type of the payload (second
argument), but not of the state (first argument), so we have to define it
ourselves.

## Stream reducers

Reducers can also react to other streams. This is also done with the `reducer`
function.

Streams are a bit more tricky to work with than actions, as they are less
predictable in how they will emit data. When a reduced state stream with a
stream reducer is started, the stream of the stream reducer will be subscribed.
The following example illustrates two examples.

```typescript
import { of } from 'rxjs';

type MyStreamState = { counter: number };
const increment$ = of([1, 2, 3]);
const otherState$ = null as any; // Imported from somewhere

const handleIncrementOf = reducer(
  increment$,
  ({ counter }: MyStreamState, count) => ({ counter: counter + count})
);

const handleIncrementByState = reducer(
  otherState$,
  (ourState: MyStreamState, otherState) => ({ ...ourState, ...otherState });
)
```

If the first reducer above is used in a stream, that stream will emit three
times right as it is starting. This is usually not something we want.

## Building Reduced State Streams

When you have the needed actions and reducers, you can build a reduced state
stream. This is done with the `persistentReducedStream` function.

```typescript
import { persistentReducedStream } from 'rxbeach';

const reducers = [
  handleIncrement,
  handleIncrementBy,
  handleIncrementOf,
  handleIncrementByState
];
const defaultState: MyStreamState = { counter: 1 };

const myStream$ = persistentReducedStream('myStream$', defaultState, reducers);
```

The stream must also be started. This can be done either with the
`.startReducing` method for each stream, or through the stream registry of
RxBeach.

```typescript
import { stateStreamRegistry } from 'rxbeach';

stateStreamRegistry.startReducing(action$);
```
