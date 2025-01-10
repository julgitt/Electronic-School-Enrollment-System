describe('registerCandidate spec', () => {
    beforeEach(() => {
        cy.clearAllCookies();
        cy.visit('/login');

        cy.intercept('POST', '/api/login').as('loginRequest');

        cy.get('input[placeholder="Email"]').type('e2etest');
        cy.get('input[placeholder="Hasło"]').type('e2epassword');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest')

        cy.url().should('include', '/registerCandidate');
    });

    afterEach(() => {
        cy.request('GET', `/api/candidate`).then((response) => {
            expect(response.status).to.eq(200);
            if (response.body.id) {
                const id = response.body.id;
                expect(id).to.exist;
                cy.request('DELETE', `/api/candidate/${id}`).then((res) => {
                    expect(res.status).to.eq(200);
                });
            } else {
                expect(response.body).to.haveOwnProperty('message');
            }
        });
    })

    it('should render the registration form', () => {
        cy.get('form').should('exist');
        cy.get('input[placeholder="Imię"]').should('exist');
        cy.get('input[placeholder="Nazwisko"]').should('exist');
        cy.get('input[placeholder="Pesel"]').should('exist');
        cy.get('button[type="submit"]').should('exist');
    });

    it('should allow the user to type into the input fields', () => {
        cy.get('input[placeholder="Imię"]').type('imie').should('have.value', 'imie');
        cy.get('input[placeholder="Nazwisko"]').type('nazwisko').should('have.value', 'nazwisko');
        cy.get('input[placeholder="Pesel"]').type('76271627').should('have.value', '76271627');
    });

    it('should display an error message on failed register', () => {
        // when
        cy.intercept('POST', '/api/candidate').as('registerRequest');

        cy.get('input[placeholder="Imię"]').type('imie').should('have.value', 'imie');
        cy.get('input[placeholder="Nazwisko"]').type('nazwisko').should('have.value', 'nazwisko');
        cy.get('input[placeholder="Pesel"]').type('44051401358').should('have.value', '44051401358');
        cy.get('button[type="submit"]').click();

        // then
        cy.wait('@registerRequest').then(({response}) => {
            expect(response).to.not.be.undefined;
            expect(response!.statusCode).to.eq(400);
            expect(response!.body).to.haveOwnProperty('message');
            expect(response!.body.message).to.eq('Błędny numer pesel.');
        })

        cy.contains('Błędny numer pesel.').should('be.visible');
        cy.getCookie('candidateId').should('not.exist');
    });

    it('should successfully register candidate', () => {
        cy.intercept('POST', '/api/candidate').as('registerRequest');

        cy.get('input[placeholder="Imię"]').type('imie').should('have.value', 'imie');
        cy.get('input[placeholder="Nazwisko"]').type('nazwisko').should('have.value', 'nazwisko');
        cy.get('input[placeholder="Pesel"]').type('84090892387').should('have.value', '84090892387');
        cy.get('button[type="submit"]').click();

        // then
        cy.wait('@registerRequest').then(({response}) => {
            expect(response).to.not.be.undefined;
            expect(response!.statusCode).to.eq(201);
            expect(response!.body).to.haveOwnProperty('message');
            expect(response!.body.message).to.eq('Registering candidate successful');
        })

        cy.url().should('include', '/');
    });
})