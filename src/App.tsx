import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import { fetchPeople, fetchPlanets } from './api';
import './App.css';
import { fetchMachine } from './machines/fetch';
import { matchingMachine } from './machines/matching';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [matchingState, sendToMatchingMachine] = useMachine(matchingMachine, {
    guards: {
      isCorrect: ctx => {
        return ctx.topSelectedItem.homeworld === ctx.bottomSelectedItem.url;
      }
    }
  });
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
  useEffect(() => {
    sendToPeopleMachine({ type: 'FETCH' });
    sendToPlanetMachine({ type: 'FETCH' });
  }, [sendToPeopleMachine, sendToPlanetMachine]);

  return (
    <div className="App">
      {matchingState.matches('answering') ? (
        <>
          <button onClick={() => sendToPeopleMachine({ type: 'FETCH' })}>
            Fetch
          </button>
          {fetchPeopleState.matches('pending') ? <p>Loading</p> : null}
          {fetchPeopleState.matches('successful.withData') ? (
            <ul>
              {fetchPeopleState.context.results &&
                fetchPeopleState.context.results.map((person, index) => (
                  <li key={index}>
                    <button
                      style={{
                        backgroundColor:
                          matchingState.context.topSelectedItem === person
                            ? 'lightblue'
                            : ''
                      }}
                      onClick={() =>
                        sendToMatchingMachine({
                          type: 'SELECT_TOP',
                          selectedItem: person
                        })
                      }
                    >
                      {person.name}
                    </button>
                  </li>
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
                  <li key={index}>
                    <button
                      style={{
                        backgroundColor:
                          matchingState.context.bottomSelectedItem === planet
                            ? 'lightblue'
                            : ''
                      }}
                      onClick={() =>
                        sendToMatchingMachine({
                          type: 'SELECT_BOTTOM',
                          selectedItem: planet
                        })
                      }
                    >
                      {planet.name}
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
          {fetchPlanetState.matches('failed') ? (
            <p>{fetchPlanetState.context.message}</p>
          ) : null}{' '}
        </>
      ) : null}
      {matchingState.matches('submitted.correct') ? (
        <p>The Force is strong with this one.</p>
      ) : null}
      {matchingState.matches('submitted.incorrect') ? (
        <p>Do or do not. There is no try.</p>
      ) : null}
    </div>
  );
}

export default App;
