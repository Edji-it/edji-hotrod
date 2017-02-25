import { SideBarComponent } from '../../app/shared/side-bar';
import { browser, by, element, protractor } from 'protractor';
import { NewReading, Login, Sidebar } from './page-objects';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the dashboard page!

    - We log into all types of account.
*/

// Now into the testing.
describe('New Reading Page', () => {

    /* ---- Variable Initialization --------------- */
    
    let newReading  = new NewReading();
    let login       = new Login();
    let sidebar     = new Sidebar();
    let EC          = protractor.ExpectedConditions;

    beforeAll(() => {
        // Login as test account that we can fill with junk data
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterUsername(login.botUser);
        login.enterPassword(login.botPassword);
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.loginButton.click();
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");
    });

    afterAll(() => {
        sidebar.logout();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('should see Edji in the title', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    /* ---- New Reading Tests ------------------------ */

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
    it('should be able to add a new reading', () => {
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading into form
        newReading.titleInput.sendKeys(newReading.titleString);
        newReading.contentInput.sendKeys(newReading.contentString);
        newReading.sourceInput.sendKeys(newReading.sourceString);
        newReading.groupInput.clear();
        newReading.groupInput.sendKeys(newReading.groupString);

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "login button never became clickable after login form entry");
        newReading.addButton.submit();

        // Should redirect to Project page for new reading
        browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");
    });


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