import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import './List.css';
import { fetchMachine } from './machines/fetch';

export function List({
  fetchData,
  selectedItem,
  onSelection
}: {
  fetchData: () => Promise<{ results: any[] }>;
  selectedItem: any;
  onSelection: (item: any) => void;
}) {
  const [fetchDataState, sendToDataMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: () => fetchData().then(r => r.results)
    }
  });
  useEffect(() => {
    sendToDataMachine({ type: 'FETCH' });
  }, [sendToDataMachine]);

  return (
    <>
      <button onClick={() => sendToDataMachine({ type: 'FETCH' })}>
        Fetch
      </button>
      {fetchDataState.matches('pending') ? <p>Loading</p> : null}
      {fetchDataState.matches('successful.withData') ? (
        <ul>
          {fetchDataState.context.results &&
            fetchDataState.context.results.map((item, index) => (
              <li key={index}>
                <button
                  className={
                    'list-button ' + (selectedItem === item ? 'selected' : '')
                  }
                  onClick={() => onSelection(item)}
                >
                  {item.name}
                </button>
              </li>
            ))}
        </ul>
      ) : null}
      {fetchDataState.matches('successful.withoutData') ? (
        <p>No data available</p>
      ) : null}
      {fetchDataState.matches('failed') ? (
        <p>{fetchDataState.context.message}</p>
      ) : null}
    </>
  );
}

export default List;
