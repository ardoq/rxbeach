import React from 'react';
import { MainHeading } from './atoms';
import { connect } from 'rxbeach/react';
import { map, take, scan, debounceTime } from 'rxjs/operators';
import { interval, Observable, timer, combineLatest, of } from 'rxjs';
import CodePreview from './CodePreview';

const State = () => {
  return (
    <div>
      <MainHeading>State</MainHeading>
      <p>
        In RxBeach, application state is contained within multiple{' '}
        <strong>state streams</strong> that emit a subset of the application
        state over time.
      </p>
      <p>
        All <strong>state streams</strong> have the following properties:
      </p>
      <ul>
        <li>
          They are replay subjects. A late subscriber will always see the
          previous value of the state stream upon subscription.
        </li>
        <li>
          They are multicast. This means that all subscribers will "share" one
          subscription to the state stream.
        </li>
        <li>
          They always start with a value. This ensures that state streams
          resolve immediately.
        </li>
      </ul>

      <MainHeading>Design considerations</MainHeading>
      <ol>
        <li>
          <h4>Why multiple state streams?</h4>
          <p>
            In contrast to Redux, an RxBeach application doesn't have a single
            store. The application state is spread across multiple state
            streams. Combined, all of the base streams represent the current
            application state (i.e. the single source of truth).
          </p>
          <p>Reasons: performance, decoupling, reselect</p>
        </li>
        <li>
          <h4>Unidirectional data flow</h4>
          <p>
            Although there are multiple state streams, the data flows in one
            direction in an RxBeach application.
          </p>
          <p>
            Actions --&gt; Base State Streams --&gt; Derived State Streams
            --&gt; Views --&gt; Actions
          </p>
        </li>
      </ol>
    </div>
  );
};

const StateReducers = () => {
  return (
    <div>
      <MainHeading>Reducer State Streams</MainHeading>
      <p>
        A state stream can be defined with a set of reducers that calculate the
        application state:
      </p>

      <MainHeading>Action reducers</MainHeading>

      <MainHeading>Stream reducers</MainHeading>
    </div>
  );
};

const DerivedState = () => {
  return (
    <div>
      <MainHeading>Derived State</MainHeading>
      <p>...</p>
    </div>
  );
};

const ProxyState = () => {
  return (
    <div>
      <MainHeading>Proxy State</MainHeading>
      <p>...</p>
      <h3>Streaming backbone collections</h3>
    </div>
  );
};

const Guidelines = () => {
  return (
    <div>
      <MainHeading>Guidelines</MainHeading>
      <p>...</p>
      <ol>
        <li>
          <h4>Serializable state</h4>
          <p>...</p>
        </li>
        <li>
          <h4>Local vs. Global state?</h4>
          <p>...</p>
        </li>
      </ol>
    </div>
  );
};

type ViewModel = {
  emissions: (string | number)[][];
};

const DiamondProblemView = ({ emissions }: ViewModel) => {
  const desiredOutput = emissions[1].map((v, i) => String(v) + emissions[2][i]);
  return (
    <div>
      <p>
        Glitches can be demonstrated by giving the classical diamond case. An
        Observable A is transformed into Observables B and C, then those are
        combined to create Observable D
      </p>
      <p>Stream a$: {emissions[0].join(', ')}</p>
      <p>Stream b$: {emissions[1].join(', ')}</p>
      <p>Stream c$: {emissions[2].join(', ')}</p>
      <p>Stream d$: {emissions[3].join(', ')}</p>
      <p>Desired output: {desiredOutput.join(', ')}</p>
    </div>
  );
};

const scope = {
  debounceTime,
  connect,
  interval,
  take,
  map,
  of,
  Observable,
  timer,
  combineLatest,
  scan,
  DiamondProblemView,
};

const IntroGlitches = () => {
  return (
    <div>
      <MainHeading>Introduction to Glitches (the Diamond Problem)</MainHeading>
      <p>
        Because we don't have a single store in an RxBeach application and state
        streams can depend on each other, an application is prone to glitches
        (also known as the diamond problem).
      </p>
      <p>
        The diamond problem occurs in observables when a destination observable
        subscribes to multiple observables which in turn subscribe to the same
        root observable. When the shared root pushes a new value, the
        destination observable will push two new values in quick succession.
      </p>
      <h3>
        Diamond Example (
        <a href="https://staltz.com/rx-glitches-arent-actually-a-problem.html">
          example taken from this article
        </a>
        )
      </h3>
      <CodePreview
        scope={scope}
        code={`
        const alphabet = ['a', 'b', 'c', 'd', 'e'];
        const a$ = timer(0, 1).pipe(take(5));      // 0, 1, 2, 3, 4
        const b$ = a$.pipe(map(i => alphabet[i])); // a, b, c, d, e
        const c$ = a$.pipe(map(i => i * i));       // 0, 1, 4, 9, 16
        const concat = (_1, _2) => String(_1).concat(String(_2));
        const d$ = combineLatest(b$, c$, concat);

        type ViewModel = {
          emissions: (string | number)[][];
        };

        // Collect emissions from all streams
        const viewModel$: Observable<ViewModel> = combineLatest(a$, b$, c$, d$).pipe(
          scan(
            (acc, emissions) => {
              emissions.map((val, i) => {
                const arr = acc[i];
                if (arr[arr.length - 1] !== val) {
                  arr.push(val);
                }
              });
              return acc;
            },
            [[], [], [], []],
          ),
          map(emissions => ({
            emissions,
          })),
        );

        const ConnectedView = connect(DiamondProblemView, viewModel$);

        render(<ConnectedView />);`}
      />
      <p>
        As Andre Staltz outlines in{' '}
        <a href="https://staltz.com/rx-glitches-arent-actually-a-problem.html">
          his article on glitches
        </a>
        , there is no operator that could replace combineLatest in the example
        above, since it would require a transaction manager under the hood.
        Nevertheless, he goes on to conclude that glitches aren't really
        problem, since they can be avoided by combining your streams differently
        (i.e. by proper software design).
      </p>
      <p>
        <a href="/?p=state-how-to-avoid-glitches">
          Read more about how we suggest to avoid glitches in RxBeach
        </a>
      </p>
    </div>
  );
};
const AvoidingGlitches = () => {
  return (
    <div>
      <h2>How to avoid glitches in RxBeach</h2>
      <p>
        In RxBeach <a href="/?p=state-glitches-intro">glitches</a> can happen in
        derived state streams. If we combine two or more streams that emit from
        the same root source, we will encounter a glitch in the derived stream
        (it will emit once for each base stream emission).
      </p>
      <p>
        There are two main strategies for avoiding glitches in an RxBeach state
        graph. As a guideline, you should aim to solve all glitches within your
        state graph by applying the software design principles below, but when
        encountering a glitch at the end of a reactive state graph you can use
        debounceTime (i.e. in a viewModel$ that is passed to a view).
      </p>
      <h3>1. Avoid glitches by "software design"</h3>
      <p>
        In{' '}
        <a href="https://staltz.com/rx-glitches-arent-actually-a-problem.html">
          his article on Rx glitches
        </a>
        , André Staltz concludes that glitches aren't really a problem because
        they can be avoided by reasoning about how your reactive graph emits
        data and using the right stream combination operators. We will refer to
        this approach as "avoiding glitches by software design".
      </p>
      <p>
        In an RxBeach application, you should follow these design principles to
        avoid introducing glitches:
      </p>
      <ol>
        <li>
          Keep your reactive state graph flat. Avoid creating unnecessary layers
          of derived state streams. <br />
        </li>
        <li>
          If you need to create a derived state stream, aim to augment the data,
          so that subscribers of the derived state stream don't need to
          subscribe to the root stream.
        </li>
        <li>
          Automatically visualize and detect glitches within your state streams
          so that you can handle them when they are introduced
        </li>
      </ol>
      <p>
        Although the above principles will help you avoid some glitches, it
        doesn't completely solve the problem. The{' '}
        <a href="/?p=views-connect">viewModel$ pattern</a> suggests that we
        should combine various state streams to prepare suitable props for a
        view. When combining these streams, we have no information about whether
        the streams depend on the same source, and since the requirements of a
        view change rapidly it is likely that a glitch can be introduced.
        Consequently, it's not feasible to avoid all glitches by software
        design.
      </p>

      <h3>2. Avoid glitches by debouncing combined stream emissions</h3>
      <p>
        As long as the combined streams emit their values synchronously,
        introducing the <strong>debounceTime</strong> operator will ensure that
        the stream only emits the "latest" value in the current frame to its
        subscribers.
      </p>
      <p>
        Adding debounceTIme ensures that the subscriber will only be called once
        when two or more combined streams emit simultaneously, but it will make
        the subscription handler async.
      </p>
      <h4>ViewModel$ glitch demonstration, try uncommenting debounceTime(0)</h4>
      <CodePreview
        scope={scope}
        code={`
        const NUMBER_OF_EMISSIONS = 5;
        const alphabet = ['a', 'b', 'c', 'd', 'e'];
        const a$ = timer(0, 25).pipe(take(NUMBER_OF_EMISSIONS)); // 0, 1, 2, 3, 4
        const b$ = a$.pipe(map(i => alphabet[i]));              // a, b, c, d, e
        const c$ = a$.pipe(map(i => i * i));                    // 0, 1, 4, 9, 16
        const concat = (_1, _2) => String(_1).concat(String(_2));
        const d$ = combineLatest(b$, c$, concat);

        type ViewModel = {
          streamEmissionCount: number;
        };

        // Collect emissions from all streams
        const viewModel$: Observable<ViewModel> = d$.pipe(
          scan((acc) => acc + 1, 0),
          map(streamEmissionCount => ({
            streamEmissionCount,
          })),
          // Try uncommenting the line below to see how it solves viewModel$ glitches
          // debounceTime(0)
        );
        
        let renderCount = 0;
        const View = ({ streamEmissionCount }: ViewModel) => {
          renderCount += 1;
          return (
            <div>
              <h4>Goal</h4>
              <p>Number of renders without glitches: {NUMBER_OF_EMISSIONS}</p>
              <h4>Actual Measurements</h4>
              <p>Number of stream emissions: {streamEmissionCount}</p>
              <p>Number of renders: {renderCount}</p>
            </div>
          );
        }

        const ConnectedView = connect(View, viewModel$);

        render(<ConnectedView />);`}
      />
      <p>
        As demonstrated above, introducing debounceTime when combining the input
        streams solves the glitch. However, it has the consequence of making the
        view rendering asynchronous. Async rendering is not a problem, since it
        will be rendered "at the end of the current call stack", but one should
        be careful when introducing debounceTime in derived state streams that
        are combined multiple times further down the graph.
      </p>
    </div>
  );
};

export default {
  title: 'State',
  id: 'state',
  pages: [
    {
      id: 'state-introduction',
      title: 'Introduction',
      component: State,
    },
    {
      id: 'state-reducers',
      title: 'Reducer State Streams',
      component: StateReducers,
    },
    {
      id: 'state-derived',
      title: 'Derived State Streams',
      component: DerivedState,
    },
    {
      id: 'state-proxy',
      title: 'Proxy State Streams',
      component: ProxyState,
    },
    {
      id: 'state-guidelines',
      title: 'Guidelines',
      component: Guidelines,
    },
    {
      id: 'state-glitches-intro',
      title: 'Introduction to Glitches',
      component: IntroGlitches,
    },
    {
      id: 'state-how-to-avoid-glitches',
      title: 'How to avoid glitches in RxBeach',
      component: AvoidingGlitches,
    },
  ],
};
