describe('login spec', () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.visit('/login');
  });

  it('should render the login form', () => {
    cy.get('form').should('exist');
    cy.get('input[placeholder="Email"]').should('exist');
    cy.get('input[placeholder="Hasło"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.get('a').should('exist');
  });

  it('should allow the user to type into the input fields', () => {
    cy.get('input[placeholder="Email"]').type('e2etest').should('have.value', 'e2etest');
    cy.get('input[placeholder="Hasło"]').type('e2epass').should('have.value', 'e2epass');
  });

  it('should display an error message on failed login', () => {
    // when
    cy.intercept('POST', '/api/login').as('loginRequest');

    cy.get('input[placeholder="Email"]').type('notexist');
    cy.get('input[placeholder="Hasło"]').type('notexist');
    cy.get('button[type="submit"]').click();

    // then
    cy.wait('@loginRequest').then(({response}) => {
      expect(response).to.not.be.undefined;
      expect(response!.statusCode).to.eq(401);
      expect(response!.body).to.haveOwnProperty('message');
      expect(response!.body.message).to.eq('Nieprawidłowe email/nazwa użytkownika lub hasło');
    })

    cy.contains('Nieprawidłowe email/nazwa użytkownika lub hasło').should('be.visible');
  });

  it('should successfully login user', () => {
    cy.intercept('POST', '/api/login').as('loginRequest');

    cy.get('input[placeholder="Email"]').type('e2etest');
    cy.get('input[placeholder="Hasło"]').type('e2epassword');
    cy.get('button[type="submit"]').click();

    // then
    cy.wait('@loginRequest').then(({response}) => {
      expect(response).to.not.be.undefined;
      expect(response!.statusCode).to.eq(200);
      expect(response!.body).to.haveOwnProperty('message');
      expect(response!.body.message).to.eq('Login successful');
      expect(response!.body).to.haveOwnProperty('redirect');
      expect(response!.body.redirect).to.eq('/');
    })

    cy.url().should('include', '/registerCandidate');
  });
})