import { browser, by, element, protractor } from 'protractor';
import Home = require('./page-objects/home-page');

/*
    18 Jan 2017
    Last Modified: 27 Jan 2017
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
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    /* ---- Navigation Tests ------------------------ */

    /* Test: Login Button goes to login page.
        - Click login button.
    */
    it ('login button should bring you to the login page.', () => {
        home.clickLogin();
        browser.wait(EC.urlContains("login"), 5000, ('Never arrived at the url containing: login.'));
    }); // it ('login button should bring you to the login page.', ()

    /* Test: View guides/faq
        - Be on any Edji page except guide.edji.it
        - Click guides button at bottom of page
        - Redirect to guide.edji.it
    */
    it('user should be able to view guides/FAQ', () => {
        
        // Click to open the link
        home.footerGuidesLink.click();

        // Did we make it to the Guides page?
        browser.wait(EC.urlContains("guide"), 5000, ('Never arrived at the url containing: guide.'));
    });

    /* Test: View Edji twitter page
        - Be on any Edji page except guide.edji.it
        - Click guides button at bottom of page
        - Redirect to Edji twitter page
    */
    it('user should be able to go to the EDJI twitter page', () => {

        // Click to open the link
        home.footerTwitterLink.click();

        // Did we make it to the Twitter page?
        browser.wait(EC.urlContains("twitter"), 5000, ('Never arrived at the url containing: Twitter.'));
    });


}); // describe 'Home Page'