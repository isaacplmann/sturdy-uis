import { Machine } from 'xstate';

// The hierarchical (recursive) schema for the states
export interface ForceSchema {
  states: {
    light: {};
    dark: {};
  };
}

// The events that the machine handles
export type ForceEvents = { type: 'CORRUPT' } | { type: 'REDEEM' };

// The context (extended state) of the machine
export interface ForceContext {}

export const forceMachine = Machine<ForceContext, ForceSchema, ForceEvents>(
  {
    id: 'force',
    initial: 'light',
    context: {},
    states: {
      light: {
        on: {
          CORRUPT: 'dark'
        }
      },
      dark: {
        activities: ['theDarknessGrows'],
        on: {
          REDEEM: 'light'
        }
      }
    }
  },
  {}
);
