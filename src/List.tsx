import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import './List.css';
import { fetchMachine } from './machines/fetch';

function randomValue(amplitude: number): number {
  return Math.random() * amplitude - amplitude / 2;
}

export function List({
  fetchData,
  selectedItem,
  onSelection,
  darkSidePower
}: {
  fetchData: () => Promise<{ results: any[] }>;
  selectedItem: any;
  onSelection: (item: any) => void;
  darkSidePower: number;
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
      {fetchDataState.matches('pending') ? <p>Loading</p> : null}
      {fetchDataState.matches('successful.withData') ? (
        <ul>
          {fetchDataState.context.results &&
            fetchDataState.context.results.map((item, index) => (
              <li
                key={index}
                style={{
                  position: 'relative',
                  top: randomValue(darkSidePower),
                  left: randomValue(darkSidePower),
                  transform: `rotate(${randomValue(darkSidePower)}deg)`,
                  transition: 'all 1s ease'
                }}
              >
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
