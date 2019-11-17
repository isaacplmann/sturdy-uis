import React, { useState } from 'react';
import { fetchPeople } from './api';
import './App.css';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Person[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  function fetchData() {
    setIsLoading(true);
    fetchPeople()
      .then(r => r.results)
      .then(
        res => {
          setResults(res);
          setIsLoading(false);
        },
        message => {
          setErrorMessage(message);
          setIsLoading(false);
        }
      );
  }

  return (
    <div className="App">
      <button onClick={() => fetchData()}>Fetch</button>
      {isLoading ? <p>Loading</p> : null}
      {!isLoading && !errorMessage ? (
        <ul>
          {results &&
            results.map((person, index) => <li key={index}>{person.name}</li>)}
        </ul>
      ) : null}
      {!isLoading && errorMessage ? <p>{errorMessage}</p> : null}
    </div>
  );
}

export default App;
