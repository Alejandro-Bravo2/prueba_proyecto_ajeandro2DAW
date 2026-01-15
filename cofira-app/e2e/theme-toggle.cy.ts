describe('Theme Toggle Functionality', () => {
  it('should allow the user to toggle between light and dark themes, and persist the choice', () => {
    cy.visit('/'); // Start from the home page

    // Check initial theme (assuming light by default if no localStorage)
    cy.get('html').should('not.have.attr', 'data-theme', 'dark');
    cy.get('app-header').find('.header__theme-toggle').should('contain', '🌙'); // Assuming moon icon for light theme

    // Toggle to dark theme
    cy.get('app-header').find('.header__theme-toggle').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('app-header').find('.header__theme-toggle').should('contain', '☀️'); // Assuming sun icon for dark theme
    cy.window().then((win) => {
      expect(win.localStorage.getItem('cofira-theme')).to.eq('dark');
    });

    // Reload page and verify theme persists
    cy.reload();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('app-header').find('.header__theme-toggle').should('contain', '☀️');

    // Toggle back to light theme
    cy.get('app-header').find('.header__theme-toggle').click();
    cy.get('html').should('not.have.attr', 'data-theme', 'dark');
    cy.get('app-header').find('.header__theme-toggle').should('contain', '🌙');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('cofira-theme')).to.eq('light');
    });
  });
});
