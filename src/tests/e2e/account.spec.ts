import { browser, by, element, protractor } from 'protractor';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the account page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Account Page', () => {

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

    /* ---- Navigation Tests ------------------------ */

    /* Test: Go to Account information page
        - Be logged into edji (teacher or student) and on dashboard, reading or project page
        - Click on your name in the bottom left corner
        - Redirect to Account info page
    */

    /* Test: Change Password - Account Info Page
        - Be on account page
        - Click change password button
        - Type old password
        - Tab to/click on new password field, enter new password
        - Tab to/click on reenter new password field, enter new password again
        - Tab to/ click on/ press enter to change password
        - Receive feedback that confirms password has been changed
        - Log out
        - Enter in username
        - Enter in new password
        - Log in
        - Redirect to correct dashboard
    */    

    /* Test: Go back to Dashboard
        - Be logged into edji (teacher or student) and on reading, account details or project page
        - Click Edji logo in top left corner of page
        - Redirect to dashboard
    */


}); // describe 'Account Page'