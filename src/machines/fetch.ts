import { Machine, assign } from 'xstate';

interface FetchStates {
  states: {
    idle: {};
    pending: {};
    successful: {};
    failed: {};
  };
}

type FetchMachineEvents =
  | { type: 'FETCH' }
  | { type: 'RESOLVE'; results: any[] }
  | { type: 'REJECT'; message: string };

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
        entry: ['fetchData'],
        on: {
          RESOLVE: { target: 'successful', actions: ['setResults'] },
          REJECT: { target: 'failed', actions: ['setMessage'] }
        }
      },
      failed: {
        on: {
          FETCH: 'pending'
        }
      },
      successful: {
        on: {
          FETCH: 'pending'
        }
      }
    }
  },
  {
    actions: {
      setResults: assign((ctx, event: any) => ({
        results: event.results
      })),
      setMessage: assign((ctx, event: any) => ({
        message: event.message
      }))
    }
  }
);
