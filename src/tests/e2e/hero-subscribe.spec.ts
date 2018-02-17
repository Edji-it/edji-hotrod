import { browser, by, element, protractor } from 'protractor';

import { Home, Hero, Login, Sidebar } from './page-objects';
import { LoginForm } from './components';


// Now into the testing.
describe('Hero Subscription Management', () => {

    /* ---- Variable Initialization --------------- */
    let login   = new Login();
    let loginForm = new LoginForm();
    let hero = new Hero();
    let home    = new Home();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital

/* ---- beforeEach ---------------------------- */
    afterEach (() => {
        sidebar.logout();
    });


/* ---- Generic Login Tests ---------------------------- */

    describe("Test Hero subscription modal as a Sidekick", () => {
        it("should login and navigate to the hero subscription page", () => {
            browser.get('/#/login');
            // log in a user
            loginForm.login();
            // verify that we reach the dashboard after login
            browser.wait(EC.urlContains("dashboard"), 5000, "never reached the dashboard after loggin in");
            // Navigate to the Hero promo page
            hero.getPage();
            // Verify we made it there
            browser.wait(EC.urlContains("hero"), 5000, "never reached the Hero promo page");
        });

        it("should open the Hero subscription modal", () => {
            browser.wait(EC.elementToBeClickable(hero.CTAbutton), 3000, "never saw Hero call to action button");
            hero.CTAbutton.click();
            // Verify modal popped up
            browser.wait(EC.elementToBeClickable(hero.subscribeModalHeader), 3000, "never saw Hero subscription modal");
        });
    });

}); // describe Login Page