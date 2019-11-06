/// <reference types="cypress" />

import { Machine, assign, send } from 'xstate';
import { createModel } from '@xstate/test';

describe('fetch', () => {
  const fetchData = () => Promise.resolve({});
  const fetchMachine = Machine(
    {
      id: 'fetch',
      initial: 'idle',
      context: {},
      states: {
        idle: {
          on: { FETCH: 'pending' },
          meta: {
            test: () => {
              cy.contains('Idle');
            }
          }
        },
        pending: {
          invoke: {
            src: 'fetchData',
            onDone: { target: 'fulfilled', actions: 'setResults' },
            onError: { target: 'rejected', actions: 'setMessage' }
          },
          meta: {
            test: () => {
              cy.contains('Loading');
            }
          }
        },
        fulfilled: {
          entry: ['setResults'],
          on: {
            FETCH: 'pending'
          },
          initial: 'unknown',
          states: {
            unknown: {
              on: {
                '': [
                  { target: 'withData', cond: 'hasData' },
                  { target: 'withoutData' }
                ]
              }
            },
            withData: {
              entry: ['notifyHasData'],
              meta: {
                test: () => {
                  cy.get('li');
                }
              }
            },
            withoutData: {
              meta: {
                test: () => {
                  cy.contains('No results');
                }
              }
            }
          }
        },
        rejected: {
          entry: ['setMessage'],
          on: {
            FETCH: 'pending'
          },
          meta: {
            test: () => {
              cy.contains('Error');
            }
          }
        }
      }
    },
    {
      services: {},
      actions: {
        setResults: assign((ctx, event) => ({
          results: event.results
        })),
        setMessage: assign((ctx, event) => ({
          message: event.message
        }))
      },
      guards: {
        hasData: (ctx, event) => !!ctx.results && ctx.results.length > 0
      }
    }
  );

  const testModel = createModel(fetchMachine, {
    events: {
      FETCH: () => {
        cy.contains('button', 'Fetch').click();
      },
      'done.invoke.fetchData': () => {
        return Promise.resolve({
          results: [
            {
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              hair_color: 'blond',
              skin_color: 'fair',
              eye_color: 'blue',
              birth_year: '19BBY',
              gender: 'male',
              homeworld: 'https://swapi.co/api/planets/1/',
              films: [
                'https://swapi.co/api/films/2/',
                'https://swapi.co/api/films/6/',
                'https://swapi.co/api/films/3/',
                'https://swapi.co/api/films/1/',
                'https://swapi.co/api/films/7/'
              ],
              species: ['https://swapi.co/api/species/1/'],
              vehicles: [
                'https://swapi.co/api/vehicles/14/',
                'https://swapi.co/api/vehicles/30/'
              ],
              starships: [
                'https://swapi.co/api/starships/12/',
                'https://swapi.co/api/starships/22/'
              ],
              created: '2014-12-09T13:50:51.644000Z',
              edited: '2014-12-20T21:17:56.891000Z',
              url: 'https://swapi.co/api/people/1/'
            },
            {
              name: 'C-3PO',
              height: '167',
              mass: '75',
              hair_color: 'n/a',
              skin_color: 'gold',
              eye_color: 'yellow',
              birth_year: '112BBY',
              gender: 'n/a',
              homeworld: 'https://swapi.co/api/planets/1/',
              films: [
                'https://swapi.co/api/films/2/',
                'https://swapi.co/api/films/5/',
                'https://swapi.co/api/films/4/',
                'https://swapi.co/api/films/6/',
                'https://swapi.co/api/films/3/',
                'https://swapi.co/api/films/1/'
              ],
              species: ['https://swapi.co/api/species/2/'],
              vehicles: [],
              starships: [],
              created: '2014-12-10T15:10:51.357000Z',
              edited: '2014-12-20T21:17:50.309000Z',
              url: 'https://swapi.co/api/people/2/'
            }
          ]
        }).then(r => r.results);
      },
      'error.platform.fetchData': () => {
        return Promise.resolve('Error');
      }
    }
  });

  const testPlans = testModel.getSimplePathPlans();

  testPlans.forEach((plan, i) => {
    describe(plan.description, () => {
      plan.paths.forEach((path, i) => {
        it(
          path.description,
          async () => {
            await cy.visit('http://localhost:3000');
            await path.test();
          },
          10000
        );
      });
    });
  });

  it('coverage', () => {
    // testModel.testCoverage();
  });
});
