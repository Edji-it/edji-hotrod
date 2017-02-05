import { browser, by, element, protractor } from 'protractor';

import { Home, Login, Sidebar } from './page-objects';
import { LoginForm } from './components';

/*
    23 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {

    /* ---- Variable Initialization --------------- */
    let login   = new Login();
    let loginForm = new LoginForm();
    let home    = new Home();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital

/* ---- beforeEach ---------------------------- */
    beforeEach (() => {
        login.getPage();
    });


/* ---- Generic Login Tests ---------------------------- */

    // test all the errors
    loginForm.testLoginErrors();

    describe("Successful login", () => {
        afterEach(() => {
            sidebar.logout();
        });

        it("should login and navigate to the dashboard", () => {
            // log in a user
            loginForm.login();

            // verify that we reach the dashboard after login
            browser.wait(EC.urlContains("dashboard"), 5000, "never reached the dashboard after loggin in");
        });
    });

}); // describe Login Page