import React, { useEffect } from 'react';
import { fetchPeople, fetchPlanets } from './api';
import './App.css';
import List from './list/List';
import { matchingMachine } from './machines/matching';
import { useMachine } from '@xstate/react';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [machine, send] = useMachine(matchingMachine, {
    guards: {
      isCorrect: (ctx, event) =>
        ctx.leftSelectedItem.homeworld === ctx.rightSelectedItem.url
    }
  });

  return (
    <div className="App">
      {machine.matches('answering') ? (
        <>
          <List
            fetchData={fetchPeople}
            onSelection={selectedItem => {
              send({ type: 'selectLeft', selectedItem });
            }}
          ></List>
          <hr></hr>
          <List
            fetchData={fetchPlanets}
            onSelection={selectedItem => {
              send({ type: 'selectRight', selectedItem });
            }}
          ></List>
        </>
      ) : null}
      {machine.matches('submitted') ? (
        <button onClick={() => send({ type: 'reset' })}>Reset</button>
      ) : null}
      {machine.matches('submitted.correct') ? (
        <p>The force is strong with this one.</p>
      ) : null}
      {machine.matches('submitted.incorrect') ? (
        <p>Do, or do not. There is no try.</p>
      ) : null}
    </div>
  );
}

export default App;
