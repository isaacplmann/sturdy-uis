import { assign, Machine } from 'xstate';

// The hierarchical (recursive) schema for the states
interface SelectionSchema {
  states: {
    unselected: {};
    selected: {};
  };
}

// The events that the machine handles
type SelectionEvents =
  | { type: 'select'; selectedIndex: number }
  | { type: 'clear' };

// The context (extended state) of the machine
interface SelectionContext {
  selectedIndex?: number;
}

export const selectionMachine = Machine<
  SelectionContext,
  SelectionSchema,
  SelectionEvents
>(
  {
    id: 'Selection',
    initial: 'unselected',
    context: {},
    states: {
      unselected: {
        on: { select: 'selected' }
      },
      selected: {
        entry: ['setSelectedIndex', 'notifySelection'],
        on: {
          select: 'selected'
        }
      }
    }
  },
  {
    actions: {
      setSelectedIndex: assign((ctx, event: any) => ({
        selectedIndex: event.selectedIndex
      }))
    }
  }
);
