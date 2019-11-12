import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import { fetchMachine } from '../machines/fetch';
import './List.css';
import ListItem from './ListItem';

function List({
  fetchData,
  onSelection
}: {
  fetchData: () => Promise<{ results: { name: string }[] }>;
  onSelection?: (selectedItem: any) => void;
}) {
  useEffect(() => {
    sendToDataMachine({ type: 'FETCH' });
  }, []);
  const [dataMachine, sendToDataMachine] = useMachine(fetchMachine, {
    actions: {
      fetchData: () => {
        fetchData()
          .then(r => r.results)
          .then(
            results => {
              sendToDataMachine({ type: 'RESOLVE', results });
            },
            message => {
              sendToDataMachine({ type: 'REJECT', message });
            }
          );
      }
    }
  });

  return (
    <>
      <button onClick={() => sendToDataMachine({ type: 'FETCH' })}>
        Fetch
      </button>
      {dataMachine.matches('idle') ? <p>Idle</p> : null}
      {dataMachine.matches('pending') ? <p>Loading</p> : null}
      {dataMachine.matches('fulfilled.withData') ? (
        <ul>
          {dataMachine.context.results &&
            dataMachine.context.results.map((item, index) => (
              <ListItem
                key={index}
                index={index}
                item={item}
                onSelection={onSelection}
              ></ListItem>
            ))}
        </ul>
      ) : null}
      {dataMachine.matches('fulfilled.withoutData') ? <p>No results</p> : null}
      {dataMachine.matches('rejected') ? (
        <p>{dataMachine.context.message}</p>
      ) : null}
    </>
  );
}

export default List;
