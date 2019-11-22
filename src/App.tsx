import { useMachine } from '@xstate/react';
import React, { useState } from 'react';
import { fetchPeople, fetchPlanets } from './api';
import { List } from './List';
import './App.css';
import { matchingMachine } from './machines/matching';
import { forceMachine } from './machines/force';

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

  const [darkSidePower, setDarkSidePower] = useState<number>(0);
  const [forceState, sendToForceMachine] = useMachine(forceMachine, {
    activities: {
      theDarknessGrows: ctx => {
        // entering dark state
        setDarkSidePower(10);
        const interval = setInterval(
          () => setDarkSidePower(power => power + 10),
          600
        );
        return () => {
          // leaving dark state
          setDarkSidePower(0);
          clearInterval(interval);
        };
      }
    }
  });

  return (
    <div className='App'>
      {matchingState.matches('quiz.answering') ? (
        <>
          <button onClick={() => sendToMatchingMachine({ type: 'CONTINUE' })}>
            Continue
          </button>
          {forceState.matches('light') ? (
            <button onClick={() => sendToForceMachine({ type: 'CORRUPT' })}>
              Come to the Dark Side
            </button>
          ) : (
            <button onClick={() => sendToForceMachine({ type: 'REDEEM' })}>
              Go Back to the Light Side
            </button>
          )}
          <List
            fetchData={fetchPeople}
            selectedItem={matchingState.context.topSelectedItem}
            onSelection={selectedItem => {
              sendToMatchingMachine({ type: 'SELECT_TOP', selectedItem });
            }}
            darkSidePower={darkSidePower}
          ></List>
          <hr />
          <List
            fetchData={fetchPlanets}
            selectedItem={matchingState.context.bottomSelectedItem}
            onSelection={selectedItem => {
              sendToMatchingMachine({ type: 'SELECT_BOTTOM', selectedItem });
            }}
            darkSidePower={darkSidePower}
          ></List>
        </>
      ) : null}
      {matchingState.matches('quiz.verifying') ? (
        <>
          <p>
            You chose{' '}
            {matchingState.context.topSelectedItem &&
              matchingState.context.topSelectedItem.name}{' '}
            and{' '}
            {matchingState.context.bottomSelectedItem &&
              matchingState.context.bottomSelectedItem.name}
          </p>
          <button
            onClick={() => sendToMatchingMachine({ type: 'CHANGE_ANSWERS' })}
          >
            Change Answers
          </button>
          <button onClick={() => sendToMatchingMachine({ type: 'SUBMIT' })}>
            Submit
          </button>
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
