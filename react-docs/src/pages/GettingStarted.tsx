import React from 'react';
import { MainHeading } from './atoms';

const Page = () => {
  return (
    <div>
      <MainHeading>Getting Started</MainHeading>
      <p>
        <strong>RxBeach</strong> is a toolbox for creating applications that use
        streams to manage state.
      </p>
      <p>
        <em>This documentation is a work in progress.</em>
      </p>

      <h3 style={{ clear: 'both' }}>Prerequisite knowledge</h3>
      <p>
        Before you dive into this documentation, we recommend that you should
        have a good understanding of the following:
      </p>
      <ol>
        <li>The Model - ViewModel - View Pattern</li>
        <li>Observables and Streams</li>
        <li>Flux or Redux</li>
      </ol>
      <p>We recommend these articles to get a refresher on those subjects:</p>
      <ul>
        <li>
          <a
            href="https://facebook.github.io/flux/docs/in-depth-overview/"
            rel="noopener noreferrer"
            target="_blank"
          >
            In-Depth Overview of Flux
          </a>
        </li>
        <li>
          <a
            href="https://blog.isquaredsoftware.com/series/idiomatic-redux/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Idiomatic Redux (article series)
          </a>
        </li>
      </ul>
    </div>
  );
};

export default {
  id: 'getting-started',
  title: 'Getting Started',
  component: Page,
};
