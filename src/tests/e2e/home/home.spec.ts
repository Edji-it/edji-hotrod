import { browser, by, element, protractor } from 'protractor';
import Home = require('./home-page');

/*
    18 Jan 2017
    Last Modified: 23 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Home Page', () => {

    /* ---- Variable Initialization --------------- */
    let home    = new Home(); // the Home pageObject.
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeEach(() => {
        home.getPage();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test FAILED', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains('Edji'), 5000, 'Title should contain "Edji".');
    });

    /* ---- Navigation Tests ------------------------ */

    /* Test: Login Button goes to login page.
        - Click login button.
    */
    it ('login button should bring you to the login page.', () => {
        

    }); // it ('login button should bring you to the login page.', ()

}); // describe 'Home Page'