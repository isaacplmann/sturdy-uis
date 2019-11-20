import { Machine, assign } from 'xstate';

interface FetchStates {
  states: {
    idle: {};
    pending: {};
    successful: {
      states: {
        unknown: {};
        withData: {};
        withoutData: {};
      };
    };
    failed: {};
  };
}

type FetchMachineEvents = { type: 'FETCH' };

interface FetchContext {
  results: any[];
  message: string;
}

export const fetchMachine = Machine<
  FetchContext,
  FetchStates,
  FetchMachineEvents
>(
  {
    id: 'fetch',
    initial: 'idle',
    context: {
      results: [],
      message: ''
    },
    states: {
      idle: {
        on: {
          FETCH: 'pending'
        }
      },
      pending: {
        invoke: {
          src: 'fetchData',
          onDone: { target: 'successful', actions: ['setResults'] },
          onError: { target: 'failed', actions: ['setMessage'] }
        }
      },
      failed: {
        on: {
          FETCH: 'pending'
        }
      },
      successful: {
        initial: 'unknown',
        on: {
          FETCH: 'pending'
        },
        states: {
          unknown: {
            on: {
              '': [
                {
                  target: 'withData',
                  cond: 'hasData'
                },
                { target: 'withoutData' }
              ]
            }
          },
          withData: {},
          withoutData: {}
        }
      }
    }
  },
  {
    actions: {
      setResults: assign((ctx, event: any) => ({
        results: event.data
      })),
      setMessage: assign((ctx, event: any) => ({
        message: event.data
      }))
    },
    guards: {
      hasData: (ctx, event: any) => {
        return ctx.results && ctx.results.length > 0;
      }
    }
  }
);
