/// <reference types="cypress" />

import { Machine, assign } from 'xstate';
import { createModel } from '@xstate/test';

describe('selection', () => {
  const selectionMachine = Machine(
    {
      id: 'Selection',
      initial: 'unselected',
      context: {},
      states: {
        unselected: {
          on: { select: 'selected' },
          meta: {
            test: () => {
              cy.get('.selected').should('have.length', 0);
            }
          }
        },
        selected: {
          entry: ['setSelectedIndex', 'notifySelection'],
          on: {
            select: 'selected'
          },
          meta: {
            test: () => {
              cy.get('.selected');
            }
          }
        }
      }
    },
    {
      actions: {
        setSelectedIndex: assign((ctx, event) => ({
          selectedIndex: event.selectedIndex
        }))
      }
    }
  );

  const testModel = createModel(selectionMachine, {
    events: {
      select: () => {
        cy.get('button.selection-button')
          .first()
          .click();
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
