import { useMachine } from '@xstate/react';
import React from 'react';
import { selectionMachine } from '../machines/select';

function ListItem({
  item,
  index,
  onSelection
}: {
  item: any;
  index: number;
  onSelection?: (selectedItem: any) => void;
}) {
  const [selectMachine, sendToSelectMachine] = useMachine(selectionMachine, {
    actions: {
      notifySelection: (ctx, event) => {
        if (item && ctx.selectedIndex === index && onSelection) {
          onSelection(item);
        }
      }
    }
  });
  return (
    <>
      <li
        className={
          selectMachine.context.selectedIndex === index ? 'selected' : ''
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
    </>
  );
}

export default ListItem;
