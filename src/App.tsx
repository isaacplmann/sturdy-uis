import { useMachine } from '@xstate/react';
import React from 'react';
import { fetchPeople, fetchPlanets } from './api';
import { List } from './List';
import './App.css';
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

  return (
    <div className='App'>
      {matchingState.matches('quiz.answering') ? (
        <>
          <button onClick={() => sendToMatchingMachine({ type: 'CONTINUE' })}>
            Continue
          </button>
          <List
            fetchData={fetchPeople}
            selectedItem={matchingState.context.topSelectedItem}
            onSelection={selectedItem => {
              sendToMatchingMachine({ type: 'SELECT_TOP', selectedItem });
            }}
          ></List>
          <hr />
          <List
            fetchData={fetchPlanets}
            selectedItem={matchingState.context.bottomSelectedItem}
            onSelection={selectedItem => {
              sendToMatchingMachine({ type: 'SELECT_BOTTOM', selectedItem });
            }}
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
