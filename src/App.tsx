import { useMachine } from '@xstate/react';
import React from 'react';
import { fetchPeople, fetchPlanets } from './api';
import './App.css';
import { fetchMachine } from './machines/fetch';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [fetchPeopleState, sendToPeopleMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: () => fetchPeople().then(r => r.results)
    }
  });
  const [fetchPlanetState, sendToPlanetMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: () => fetchPlanets().then(r => r.results)
    }
  });

  return (
    <div className="App">
      <button onClick={() => sendToPeopleMachine({ type: 'FETCH' })}>
        Fetch
      </button>
      {fetchPeopleState.matches('pending') ? <p>Loading</p> : null}
      {fetchPeopleState.matches('successful.withData') ? (
        <ul>
          {fetchPeopleState.context.results &&
            fetchPeopleState.context.results.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
        </ul>
      ) : null}
      {fetchPeopleState.matches('successful.withoutData') ? (
        <p>No data available</p>
      ) : null}
      {fetchPeopleState.matches('failed') ? (
        <p>{fetchPeopleState.context.message}</p>
      ) : null}

      <hr />

      <button onClick={() => sendToPlanetMachine({ type: 'FETCH' })}>
        Fetch
      </button>
      {fetchPlanetState.matches('pending') ? <p>Loading</p> : null}
      {fetchPlanetState.matches('successful') ? (
        <ul>
          {fetchPlanetState.context.results &&
            fetchPlanetState.context.results.map((planet, index) => (
              <li key={index}>{planet.name}</li>
            ))}
        </ul>
      ) : null}
      {fetchPlanetState.matches('failed') ? (
        <p>{fetchPlanetState.context.message}</p>
      ) : null}
    </div>
  );
}

export default App;
