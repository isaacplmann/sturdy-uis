import { assign, Machine } from 'xstate';

// The hierarchical (recursive) schema for the states
interface MatchingSchema {
  states: {
    answering: {
      states: {
        leftSide: {
          states: {
            unselected: {};
            selected: {};
          };
        };
        rightSide: {
          states: {
            unselected: {};
            selected: {};
          };
        };
      };
    };
    submitted: {
      states: {
        evaluating: {};
        correct: {};
        incorrect: {};
      };
    };
  };
}

// The events that the machine handles
type MatchingEvents =
  | { type: 'selectLeft'; selectedItem: any }
  | { type: 'selectRight'; selectedItem: any }
  | { type: 'reset' };

// The context (extended state) of the machine
interface MatchingContext {
  leftSelectedItem: any | undefined;
  rightSelectedItem: any | undefined;
}

export const matchingMachine = Machine<
  MatchingContext,
  MatchingSchema,
  MatchingEvents
>(
  {
    id: 'Matching',
    initial: 'answering',
    context: {
      leftSelectedItem: undefined,
      rightSelectedItem: undefined
    },
    states: {
      answering: {
        type: 'parallel',
        states: {
          leftSide: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  selectLeft: 'selected'
                }
              },
              selected: {
                type: 'final',
                entry: ['setLeftSelectedItem'],
                on: {
                  selectLeft: 'selected'
                }
              }
            }
          },
          rightSide: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  selectRight: 'selected'
                }
              },
              selected: {
                type: 'final',
                entry: ['setRightSelectedItem'],
                on: {
                  selectRight: 'selected'
                }
              }
            }
          }
        },
        onDone: 'submitted'
      },
      submitted: {
        initial: 'evaluating',
        on: {
          reset: 'answering'
        },
        exit: ['clearSelections'],
        states: {
          evaluating: {
            on: {
              '': [
                { target: 'correct', cond: 'isCorrect' },
                { target: 'incorrect' }
              ]
            }
          },
          correct: {},
          incorrect: {}
        }
      }
    }
  },
  {
    actions: {
      setLeftSelectedItem: assign((ctx, event: any) => ({
        leftSelectedItem: event.selectedItem
      })),
      setRightSelectedItem: assign((ctx, event: any) => ({
        rightSelectedItem: event.selectedItem
      })),
      clearSelections: assign(() => ({
        leftSelectedItem: undefined,
        rightSelectedItem: undefined
      }))
    },
    guards: {
      isCorrect: () => true
    }
  }
);
