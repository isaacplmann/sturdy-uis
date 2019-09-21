import { useMachine } from '@xstate/react';
import React from 'react';
import { fetchPeople, mockFetch, fetchPlanets } from './api';
import './App.css';
import { fetchMachine } from './machines/fetch';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [peopleMachine, sendToPeopleMachine] = useMachine(fetchMachine, {
    actions: {
      fetchData: () => {
        fetchPeople()
          .then(r => r.results)
          .then(
            results => {
              sendToPeopleMachine({ type: 'RESOLVE', results });
            },
            message => {
              sendToPeopleMachine({ type: 'REJECT', message });
            }
          );
      }
    }
  });
  const [planetMachine, sendToPlanetMachine] = useMachine(fetchMachine, {
    actions: {
      fetchData: () => {
        fetchPlanets()
          .then(r => r.results)
          .then(
            results => {
              sendToPlanetMachine({ type: 'RESOLVE', results });
            },
            message => {
              sendToPlanetMachine({ type: 'REJECT', message });
            }
          );
      }
    }
  });

  return (
    <div className="App">
      <button onClick={() => sendToPeopleMachine({ type: 'FETCH' })}>
        Fetch People
      </button>
      {peopleMachine.matches('idle') ? <p>Idle</p> : null}
      {peopleMachine.matches('pending') ? <p>Loading</p> : null}
      {peopleMachine.matches('fulfilled.withData') ? (
        <ul>
          {peopleMachine.context.results &&
            peopleMachine.context.results.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
        </ul>
      ) : null}
      {peopleMachine.matches('fulfilled.withoutData') ? (
        <p>No results</p>
      ) : null}
      {peopleMachine.matches('rejected') ? (
        <p>{peopleMachine.context.message}</p>
      ) : null}

      <hr></hr>

      <button onClick={() => sendToPlanetMachine({ type: 'FETCH' })}>
        Fetch Planets
      </button>
      {planetMachine.matches('idle') ? <p>Idle</p> : null}
      {planetMachine.matches('pending') ? <p>Loading</p> : null}
      {planetMachine.matches('fulfilled.withData') ? (
        <ul>
          {planetMachine.context.results &&
            planetMachine.context.results.map((planet, index) => (
              <li key={index}>{planet.name}</li>
            ))}
        </ul>
      ) : null}
      {planetMachine.matches('fulfilled.withoutData') ? (
        <p>No results</p>
      ) : null}
      {planetMachine.matches('rejected') ? (
        <p>{planetMachine.context.message}</p>
      ) : null}
    </div>
  );
}

export default App;
