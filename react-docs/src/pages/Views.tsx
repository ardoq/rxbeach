import React, { useMemo } from 'react';
import { MainHeading } from './atoms';
import CodePreview from './CodePreview';
import { interval } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { useStream, NOT_YET_EMITTED, connect } from 'rxbeach/react';

const Views = () => {
  return (
    <div>
      <MainHeading>Views</MainHeading>
      <p>Goal: Simple views that react to state changes</p>
      <p>
        A view's core responsibility is to display data and dispatch events
        according to the user's actions.
      </p>
      <p>Todo...</p>
    </div>
  );
};

const scope = {
  useStream,
  NOT_YET_EMITTED,
  interval,
  take,
  map,
  connect,
  useMemo,
};
const ConnectingViews = () => {
  return (
    <div>
      <MainHeading>Connecting Views To Streams</MainHeading>
      <p>
        When connecting a view to application state, it is important to maintain
        separation of concerns. Since the view layer is likely to change often
        through an application's development lifecycle, we must ensure that
        making changes to a view is simple.
      </p>
      <p>
        In an RxBeach application, we achieve this by ensuring that the view
        connects to a <strong>viewModel$</strong> stream, which maps the data to
        a suitable format for the view. As a result, the view does not depend
        directly on any application streams. The view only depends on being
        "fed" a viewModel in the correct format.
      </p>
      <h2>Connecting to Streams in a React Application</h2>
      <h3>
        <code>connect</code> - Higher Order Component Example
      </h3>
      <p>
        When using <code>connect</code>, the view is not rendered until the
        stream emits its first value.
      </p>
      <CodePreview
        scope={scope}
        code={`
        // These imports are injected
        // import { interval, Observable } from 'rxjs';
        // import { take, map } from 'rxjs/operators';
        // import { connect } from 'rxbeach/react';

        const number$ = interval(1000);
        const viewModel$: Observable<ViewModel> = number$.pipe(
          take(100),
          map(number => ({
            number
          }))
        );

        type ViewModel = {
          number: number;
        };

        const View = ({ number }: ViewModel) => {
          return <p>Value: {number}</p>;
        };

        const ConnectedView = connect(View, viewModel$);

        render(<ConnectedView />);`}
      />
      <h3>
        <code>useStream</code> - Hooks Example
      </h3>
      <p>
        With the <code>useStream</code> hook, the view can explicitly handle
        what happens when the stream hasn't emitted a value yet.
      </p>
      <p>
        The <code>useStream</code> hook allows to combine regular view props
        with streamed data more easily.
      </p>
      <h3>Simple useStream example</h3>
      <CodePreview
        scope={scope}
        code={`
        // These imports are injected
        // import { interval } from 'rxjs';
        // import { take } from 'rxjs/operators';
        // import { useStream, NOT_YET_EMITTED } from 'rxbeach/react';


        type ViewModel = {
          number: number;
        };

        const number$ = interval(1000);
        const viewModel$: Observable<ViewProps> = number$.pipe(
          take(100),
          map(number => ({
            number
          }))
        );

        const ConnectedView = () => {
          const viewModel = useStream(viewModel$);
          if (viewModel === NOT_YET_EMITTED) {
            return <p>Waiting for first value...</p>;
          }
          return <p>Value: {viewModel.number}</p>;
        };
        
        render(<ConnectedView />);`}
      />
      <h3>Combining regular view props with streamed data</h3>
      <CodePreview
        scope={scope}
        code={`
        // These imports are injected
        // import { interval } from 'rxjs';
        // import { take } from 'rxjs/operators';
        // import { useMemo } from 'React';
        // import { useStream, NOT_YET_EMITTED } from 'rxbeach/react';

        type ViewModel = {
          number: number;
        };

        const View = ({ number }: ViewModel) => {
          return <p>Value: {number}</p>;
        };

        const number$ = interval(1000);
        const getViewModel$ = (multiplier: number): Observable<ViewModel> => {
          return number$.pipe(
            take(100),
            map((number => ({
              number: number * multiplier
            })))
          );
        };

        type ConnectedViewProps = {
          multiplier: number;
        };

        const ConnectedView = ({ multiplier }: ConnectedViewProps) => {
          const viewModel$ = useMemo(() => getViewModel$(multiplier), [multiplier]);
          const viewModel = useStream(viewModel$);
          if (viewModel === NOT_YET_EMITTED) {
            return <p>Waiting for first value...</p>;
          }
          return <View number={viewModel.number} />;
        };
        
        render(<ConnectedView multiplier={2} />);`}
      />
    </div>
  );
};

const LocalViewState = () => {
  return (
    <div>
      <MainHeading>Local View State vs. State Streams</MainHeading>
      <p>Todo...</p>
    </div>
  );
};

export default {
  title: 'Views',
  id: 'views',
  pages: [
    {
      id: 'views-intro',
      title: 'Introduction',
      component: Views,
    },
    {
      id: 'views-connect',
      title: 'Connecting Views to State Streams',
      component: ConnectingViews,
    },
    {
      id: 'views-when-to-use-state-streams',
      title: 'Local View State vs. State Streams',
      component: LocalViewState,
    },
  ],
};
