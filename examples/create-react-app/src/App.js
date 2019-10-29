import React from 'react';
import './App.css';
import { dispatchAction, action$ } from './globalActions';
import { actionCreator } from 'rxbeach';
import { ofType } from 'rxbeach/operators';
import { scan, tap } from 'rxjs/operators';
import { useStream } from './utils';
import { create } from 'rxjs-spy';

export const spy = create();
const increment = actionCreator('increment');
spy.log(/action/);

const incrementStream = action$.pipe(
  ofType(increment),
  tap(() => console.log('incrementing')),
  scan(acc => acc + 1, 0)
);

function App() {
  const value = useStream(incrementStream, 0);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Value: {value}</h1>
        <p>Open the console to see logging from the action stream</p>
        <button type="text" onClick={() => dispatchAction(increment())}>
          Increment
        </button>
      </header>
    </div>
  );
}

export default App;
