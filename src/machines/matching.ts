import { assign, Machine } from 'xstate';

// The hierarchical (recursive) schema for the states
interface MatchingSchema {
  states: {
    answering: {
      states: {
        notReadyToSubmit: {
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
            hist: {};
          };
        };
        readyToSubmit: {};
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
  | { type: 'continue' }
  | { type: 'changeAnswers' }
  | { type: 'submit' }
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
        initial: 'notReadyToSubmit',
        states: {
          notReadyToSubmit: {
            type: 'parallel',
            on: {
              continue: {
                target: 'readyToSubmit',
                cond: 'areQuestionsAnswered'
              }
            },
            states: {
              leftSide: {
                initial: 'unselected',
                states: {
                  unselected: {
                    on: {
                      selectLeft: {
                        target: 'selected',
                        actions: ['setLeftSelectedItem']
                      }
                    }
                  },
                  selected: {
                    type: 'final',
                    on: {
                      selectLeft: {
                        target: 'selected',
                        actions: ['setLeftSelectedItem']
                      }
                    }
                  }
                }
              },
              rightSide: {
                initial: 'unselected',
                states: {
                  unselected: {
                    on: {
                      selectRight: {
                        target: 'selected',
                        actions: ['setRightSelectedItem']
                      }
                    }
                  },
                  selected: {
                    type: 'final',
                    on: {
                      selectRight: {
                        target: 'selected',
                        actions: ['setRightSelectedItem']
                      }
                    }
                  }
                }
              },
              hist: {
                type: 'history',
                history: 'deep'
              }
            }
          },
          readyToSubmit: {
            on: {
              changeAnswers: 'notReadyToSubmit.hist',
              submit: '#submitted'
            }
          }
        }
      },
      submitted: {
        id: 'submitted',
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
          ? event.selectedItem
          : ctx.leftSelectedItem
      })),
      setRightSelectedItem: assign((ctx, event: any) => ({
        rightSelectedItem: event.selectedItem
          ? event.selectedItem
          : ctx.rightSelectedItem
      })),
      clearSelections: assign(() => ({
        leftSelectedItem: undefined,
        rightSelectedItem: undefined
      }))
    },
    guards: {
      areQuestionsAnswered: ctx => {
        return ctx.leftSelectedItem && ctx.rightSelectedItem;
      },
      isCorrect: () => true
    }
  }
);
