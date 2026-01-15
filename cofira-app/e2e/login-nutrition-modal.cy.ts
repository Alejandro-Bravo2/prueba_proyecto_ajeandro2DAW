describe('User Login, Nutrition Page Navigation, and Ingredients Modal Flow', () => {
  beforeEach(() => {
    // Assuming a way to seed data or ensure a test user exists
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('user@example.com');
    cy.get('input[formControlName="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/'); // Should redirect to home after login
  });

  it('should allow a logged-in user to navigate to nutrition, view daily menu, and open/close ingredients modal', () => {
    // 1. Navigate to Nutrition Page
    cy.get('app-header').contains('Alimentación').click(); // Adjust selector as needed
    cy.url().should('include', '/alimentacion');
    cy.contains('Tu Menú Diario');

    // 2. Open Ingredients Modal
    cy.get('app-daily-menu').as('dailyMenu');
    cy.get('@dailyMenu').find('.meal-section__info-button').first().click();

    // 3. Verify Modal Content
    cy.get('.c-modal__overlay').should('be.visible');
    cy.get('.c-modal__title').should('contain', 'Ingredientes - Desayuno'); // Assuming default title
    cy.get('.ingredients-list').should('contain', 'Pollo');
    cy.get('.total-cost__value').should('contain', '3.60');

    // 4. Close Modal by clicking backdrop
    cy.get('.c-modal__overlay').click({ force: true }); // Click on the backdrop
    cy.get('.c-modal__overlay').should('not.exist');

    // 5. Re-open and close with ESC key
    cy.get('@dailyMenu').find('.meal-section__info-button').first().click();
    cy.get('.c-modal__overlay').should('be.visible');
    cy.wait(500); // Give some time for modal to fully open and listen for events
    cy.realPress('Escape');
    cy.get('.c-modal__overlay').should('not.exist');
  });
});
