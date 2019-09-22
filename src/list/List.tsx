import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import { fetchMachine } from '../machines/fetch';
import { selectionMachine } from '../machines/select';
import './List.css';

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

  const [selectMachine, sendToSelectMachine] = useMachine(selectionMachine, {
    actions: {
      notifySelection: (ctx, event) => {
        if (
          dataMachine.context.results &&
          ctx.selectedIndex !== undefined &&
          onSelection
        ) {
          onSelection(dataMachine.context.results[ctx.selectedIndex]);
        }
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
              <li
                key={index}
                className={
                  selectMachine.context.selectedIndex === index
                    ? 'selected'
                    : ''
                }
              >
                <button
                  className="selection-button"
                  onClick={() =>
                    sendToSelectMachine({
                      type: 'select',
                      selectedIndex: index
                    })
                  }
                >
                  {item.name}
                </button>
              </li>
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
