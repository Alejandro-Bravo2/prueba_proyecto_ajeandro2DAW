describe('User Registration, Onboarding, and Dashboard Flow', () => {
  beforeEach(() => {
    cy.visit('/register'); // Assuming /register is the registration page
  });

  it('should allow a new user to register, complete onboarding, and land on the dashboard', () => {
    // 1. Registration
    cy.get('input[formControlName="name"]').type('Test User');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('Password123!');
    cy.get('input[formControlName="confirmPassword"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Assuming successful registration redirects to /login
    cy.url().should('include', '/login');
    cy.contains('Registro exitoso. ¡Bienvenido!'); // Verify toast message

    // 2. Login (after registration)
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    // Assuming successful login redirects to /onboarding or home
    cy.url().should('include', '/onboarding');
    cy.contains('Cuéntanos sobre ti'); // Verify onboarding step 1

    // 3. Complete Onboarding (example steps)
    // Step 1: About Me
    cy.get('button').contains('Masculino').click();
    cy.get('select[formControlName="height"]').select('180');
    cy.get('select[formControlName="age"]').select('30');
    cy.get('button').contains('Continuar').click();

    // Step 2: Nutrition Preferences
    cy.url().should('include', '/onboarding/nutrition');
    cy.contains('¿Con qué frecuencia quieres variedad en tus comidas?');
    cy.get('button').contains('Mucha variedad').click();
    cy.get('button').contains('Continuar').click();

    // Step 3: Goal
    cy.url().should('include', '/onboarding/goal');
    cy.contains('¿Cuál es tu principal objetivo con COFIRA?');
    cy.get('button').contains('Perder grasa').click();
    cy.get('button').contains('Continuar').click();

    // Step 4: Pricing
    cy.url().should('include', '/onboarding/pricing');
    cy.contains('¿Cuánto sueles gastar por comida?');
    cy.get('button').contains('10-15€').click();
    cy.get('button').contains('Continuar').click();

    // Step 5: Muscles
    cy.url().should('include', '/onboarding/muscles');
    cy.contains('¿Estás interesado en enfocarte en algunos grupos musculares?');
    cy.get('button').contains('Pecho').click();
    cy.get('button').contains('Brazos').click();
    cy.get('button').contains('Continuar').click(); // Finalizar button text

    // 4. Land on Dashboard
    cy.url().should('include', '/dashboard'); // Assuming final redirect to dashboard
    cy.contains('Bienvenido al Dashboard'); // Verify dashboard content
  });
});
