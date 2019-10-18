import { Machine } from 'xstate';

// The hierarchical (recursive) schema for the states
export interface RandomizedSchema {
  states: {
    default: {};
    randomized: {};
  };
}

// The events that the machine handles
export type RandomizedEvents = { type: 'randomize' } | { type: 'reset' };

// The context (extended state) of the machine
export interface RandomizedContext {}

export type RandomizedMachine = typeof randomizedMachine;

export const randomizedMachine = Machine<
  RandomizedContext,
  RandomizedSchema,
  RandomizedEvents
>(
  {
    id: 'Randomized',
    initial: 'default',
    context: {},
    states: {
      default: {
        on: {
          randomize: 'randomized'
        }
      },
      randomized: {
        activities: 'chaosIsHappening',
        on: {
          reset: 'default',
          randomize: 'randomized'
        }
      }
    }
  },
  {
    activities: {
      chaosIsHappening: () => {}
    }
  }
);
