describe('User Login and Training Completion Flow', () => {
  beforeEach(() => {
    // Assuming a way to seed data or ensure a test user exists
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('user@example.com');
    cy.get('input[formControlName="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/'); // Should redirect to home after login
  });

  it('should allow a logged-in user to navigate to training, mark an exercise as complete, and persist the change', () => {
    // 1. Navigate to Training Page
    cy.get('app-header').contains('Entrenamiento').click(); // Adjust selector as needed
    cy.url().should('include', '/entrenamiento');
    cy.contains('Tu Entrenamiento Semanal');

    // 2. Mark an exercise as complete
    cy.get('app-weekly-table').as('trainingTable');
    cy.get('@trainingTable').find('input[type="checkbox"]').first().as('firstCheckbox');
    cy.get('@firstCheckbox').check().should('be.checked');

    // 3. Verify persistence (reloading the page or navigating back and forth)
    // For a real test, you'd check backend or localStorage directly.
    // For this example, we'll just reload the page and check the checkbox state.
    cy.reload();
    cy.get('@trainingTable').find('input[type="checkbox"]').first().should('be.checked');

    // Optionally fill out feedback form (basic interaction)
    cy.get('textarea[placeholder*="más difíciles"]').type('Press banca me cuesta mucho hoy.');
    cy.get('textarea[placeholder*="más peso"]').type('Creo que puedo con más peso en sentadilla.');
    cy.get('button').contains('Enviar Retroalimentación').click();
    // Verify toast or success message if any
    cy.contains('Retroalimentación enviada', { timeout: 10000 }).should('be.visible'); // Example of toast message verification
  });
});
