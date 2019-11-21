import { Machine, assign } from 'xstate';

interface MatchingSchema {
  states: {
    quiz: {
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
        verifying: {};
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
  | { type: 'CONTINUE' }
  | { type: 'CHANGE_ANSWERS' }
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
    initial: 'quiz',
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined
    },
    states: {
      quiz: {
        initial: 'answering',
        states: {
          answering: {
            type: 'parallel',
            on: {
              CONTINUE: {
                target: 'verifying'
              }
            },
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
                    on: {
                      SELECT_TOP: {
                        target: 'selected',
                        actions: ['setTopSelectedItem']
                      }
                    }
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
                    on: {
                      SELECT_BOTTOM: {
                        target: 'selected',
                        actions: ['setBottomSelectedItem']
                      }
                    }
                  }
                }
              }
            }
          },
          verifying: {
            on: {
              CHANGE_ANSWERS: 'answering'
            }
          }
        }
      },
      submitted: {
        initial: 'evaluating',
        on: {
          RESET: { target: 'quiz', actions: ['clearSelection'] }
        },
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
      })),
      clearSelection: assign((ctx, event) => ({
        topSelectedItem: undefined,
        bottomSelectedItem: undefined
      }))
    }
  }
);
