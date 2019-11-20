import { Machine, assign } from 'xstate';

interface MatchingSchema {
  states: {
    answering: {
      states: {
        topList: {
          states: {
            unselected: {};
            selected: {};
          };
        };
        bottomList: {
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

type MatchingEvents =
  | { type: 'SELECT_TOP'; selectedItem: any }
  | { type: 'SELECT_BOTTOM'; selectedItem: any }
  | { type: 'RESET' };

// The context (extended state) of the machine
interface MatchingContext {
  topSelectedItem: any | undefined;
  bottomSelectedItem: any | undefined;
}

export const matchingMachine = Machine<
  MatchingContext,
  MatchingSchema,
  MatchingEvents
>(
  {
    id: 'matching',
    initial: 'answering',
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined
    },
    states: {
      answering: {
        type: 'parallel',
        onDone: 'submitted',
        states: {
          topList: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  SELECT_TOP: {
                    target: 'selected',
                    actions: ['setTopSelectedItem']
                  }
                }
              },
              selected: {
                type: 'final'
              }
            }
          },
          bottomList: {
            initial: 'unselected',
            states: {
              unselected: {
                on: {
                  SELECT_BOTTOM: {
                    target: 'selected',
                    actions: ['setBottomSelectedItem']
                  }
                }
              },
              selected: {
                type: 'final'
              }
            }
          }
        }
      },
      submitted: {
        initial: 'evaluating',
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
      setTopSelectedItem: assign((ctx, event: any) => ({
        topSelectedItem: event.selectedItem
      })),
      setBottomSelectedItem: assign((ctx, event: any) => ({
        bottomSelectedItem: event.selectedItem
      }))
    }
  }
);
