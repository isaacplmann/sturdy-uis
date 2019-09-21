import { useMachine } from '@xstate/react';
import React from 'react';
import { fetchPeople } from './api';
import './App.css';
import { fetchMachine } from './machines/fetch';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [peopleMachine, send] = useMachine(fetchMachine, {
    actions: {
      fetchData: () => {
        fetchPeople()
          .then(r => r.results)
          .then(
            results => {
              console.log(results);
              send({ type: 'RESOLVE', results });
            },
            message => {
              console.log(message);
              send({ type: 'REJECT', message });
            }
          );
      }
    }
  });

  return (
    <div className="App">
      <button onClick={() => send({ type: 'FETCH' })}>Fetch</button>
      {peopleMachine.matches('idle') ? <p>Idle</p> : null}
      {peopleMachine.matches('pending') ? <p>Loading</p> : null}
      {peopleMachine.matches('fulfilled') ? (
        <ul>
          {peopleMachine.context.results &&
            peopleMachine.context.results.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
        </ul>
      ) : null}
      {peopleMachine.matches('rejected') ? (
        <p>{peopleMachine.context.message}</p>
      ) : null}
    </div>
  );
}

export default App;
