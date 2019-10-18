import { useMachine } from '@xstate/react';
import React, { useEffect, useState } from 'react';
import { fetchMachine } from '../machines/fetch';
import { randomizedMachine } from '../machines/randomized';
import { selectionMachine } from '../machines/select';
import './List.css';

function randomValue(amplitude: number): number {
  return Math.random() * amplitude - amplitude / 2;
}

export enum SideOfTheForce {
  Light,
  Dark
}

function List({
  fetchData,
  sideOfTheForce = SideOfTheForce.Light,
  selectedItem,
  onSelection
}: {
  fetchData: () => Promise<{ results: { name: string }[] }>;
  selectedItem?: any;
  sideOfTheForce?: SideOfTheForce;
  onSelection?: (selectedItem: any) => void;
}) {
  const [dataState, sendToDataMachine] = useMachine(fetchMachine, {
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
      },
      notifyHasData: ctx => {
        selectionState.context.selectedIndex =
          ctx.results &&
          ctx.results.findIndex(
            item => selectedItem && selectedItem.name === item.name
          );
      }
    }
  });
  useEffect(() => {
    sendToDataMachine({ type: 'FETCH' });
  }, [sendToDataMachine]);

  const [selectionState, sendToSelectMachine] = useMachine(selectionMachine, {
    actions: {
      notifySelection: (ctx, event) => {
        if (
          dataState.context.results &&
          ctx.selectedIndex !== undefined &&
          onSelection
        ) {
          onSelection(dataState.context.results[ctx.selectedIndex]);
        }
      }
    }
  });

  const [amplitude, setAmplitude] = useState<number>(0);
  const [randomizedState, sendToRandomizedMachine] = useMachine(
    randomizedMachine,
    {
      activities: {
        chaosIsHappening: (ctx, activity) => {
          // Start the activity
          setAmplitude(prev => prev + 10);
          const interval = setInterval(
            () => setAmplitude(prev => prev + 10),
            600
          );

          // Return a function that stops the activity
          return () => {
            setAmplitude(0);
            clearInterval(interval);
          };
        }
      }
    }
  );

  useEffect(() => {
    sendToRandomizedMachine(
      sideOfTheForce === SideOfTheForce.Dark ? 'randomize' : 'reset'
    );
  }, [sendToRandomizedMachine, sideOfTheForce]);

  return (
    <>
      <button onClick={() => sendToDataMachine({ type: 'FETCH' })}>
        Fetch
      </button>
      {dataState.matches('idle') ? <p>Idle</p> : null}
      {dataState.matches('pending') ? <p>Loading</p> : null}
      {dataState.matches('fulfilled.withData') ? (
        <ul>
          {dataState.context.results &&
            dataState.context.results.map((item, index) => (
              <li
                key={index}
                className={
                  selectionState.context.selectedIndex === index
                    ? 'selected'
                    : ''
                }
                style={
                  randomizedState.matches('randomized')
                    ? {
                        position: 'relative',
                        top: randomValue(amplitude),
                        left: randomValue(amplitude),
                        transform: `rotate(${randomValue(amplitude)}deg)`,
                        transition: 'all 1s ease'
                      }
                    : {}
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
      {dataState.matches('fulfilled.withoutData') ? <p>No results</p> : null}
      {dataState.matches('rejected') ? (
        <p>{dataState.context.message}</p>
      ) : null}
    </>
  );
}

export default List;
