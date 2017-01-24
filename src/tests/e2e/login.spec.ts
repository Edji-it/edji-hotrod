import { browser, by, element, protractor } from 'protractor';
import Login = require('./page-objects/login-page');

/*
    23 Jan 2017
    Last Modified: 23 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {

    /* ---- Variable Initialization --------------- */
    let Login   = new Login();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */
    beforeEach (() => {

    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test FAILED', () => {
        let subject = browser.getTitle();
        browser.wait(EC.titleContains('PEdji'), 5000, 'Title should contain "Edji".');
    });

    /* ---- Login Tests ---------------------------- */


}); // describe Login Page