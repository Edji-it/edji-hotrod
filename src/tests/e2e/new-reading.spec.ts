import { browser, by, element, protractor } from 'protractor';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the dashboard page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Dashboard Page', () => {

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

     /* Test: Student account can log out successfully
        - Log in with Student account
        - Arrive at Dashboard
        - Log out and arrive at home page
    */

    /* Test: Add a reading
        - Go to Teacher Dashboard
        - Click add a reading button
        - Redirect to Add a Reading page
        - Click on new title box and Enter title
        - Tab/click to source url, enter URL
        - Tab/click to contact, paste content or type in content
        - Tab and hit enter/ click on “Add reading button”
        - Redirect to reading page of newly created reading
    */

    /* Test: Add reading, don’t enter title
        - Go to Teacher Dashboard
        - Click add a reading button
        - Redirect to Add a Reading page
        - Tab/click to source url, enter URL
        - Tab/click to contact, paste content or type in content
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading a title
    */

    /* Test: Add reading, don’t enter content
        - Go to Teacher Dashboard
        - Click add a reading button
        - Redirect to Add a Reading page
        - Click on new title box, enter title
        - Tab/click to source url, enter URL
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading some content
    */

    /* Test: Add reading, then adjust with editing buttons. (Headers, bold, underlines, italixs, text size)
        - Log in with Teacher account
        - Arrive at Dashboard
        - Add reading content.
        - Adjust editing buttons.
        - Click Add Reading
    */

}); // describe 'Account Page'