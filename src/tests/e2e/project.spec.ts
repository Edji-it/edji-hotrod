import { browser, by, element, protractor } from 'protractor';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the Project page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Project Page', () => {

    /* ---- Variable Initialization --------------- */
    
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeEach(() => {
        
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

    /* ---- Dashboard Tests ------------------------ */

    /* Test: Make a comment on a project
        - Go to a valid project
        - Click and highlight section of the text
        - Click Emoji button
        - Go to Emoji keyboard (on screen) and choose an emoji
        - Click done button
    */

    /* Test: 
        - log in to student account
        - add a project from dashboard
        - go to said project 
        - then go back to the dashboard 
        - project should still exist.
    */
     
}); // describe 'Dashboard Page'
  