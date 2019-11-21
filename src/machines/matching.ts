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
            hist: {};
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
  | { type: 'SUBMIT' }
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
                    },
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
                    on: {
                      SELECT_BOTTOM: {
                        target: 'selected',
                        actions: ['setBottomSelectedItem']
                      }
                    },
                    type: 'final'
                  }
                }
              },
              hist: {
                type: 'history',
                history: 'deep'
              }
            }
          },
          verifying: {
            on: {
              CHANGE_ANSWERS: 'answering.hist',
              SUBMIT: '#submitted'
            }
          }
        }
      },
      submitted: {
        id: 'submitted',
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
