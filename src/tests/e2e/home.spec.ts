import { browser, by, element, protractor } from 'protractor';

import { Home, Login, Sidebar } from './page-objects';

/*
    18 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Home Page', () => {

    /* ---- Variable Initialization --------------- */
    let home    = new Home(); // the Home pageObject.
    let login   = new Login();
    let sidebar = new Sidebar();
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
        browser.wait(EC.elementToBeClickable(home.loginLink), 5000);
        home.clickLogin();
        browser.wait(EC.urlContains("login"), 5000, ('Never arrived at the url containing: login.'));
    }); // it ('login button should bring you to the login page.', ()

    /* Test: View guides/faq
        - Be on any Edji page except guide.edji.it
        - Click guides button at bottom of page
        - Redirect to guide.edji.it
    */
    it('user should be able to view guides/FAQ', () => {
        browser.wait(EC.elementToBeClickable(home.footerGuidesLink), 5000);
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
        browser.wait(EC.elementToBeClickable(home.footerTwitterLink), 5000);
        // Click to open the link
        home.footerTwitterLink.click();

        // Did we make it to the Twitter page?
        browser.wait(EC.urlContains("twitter"), 10000, ('Never arrived at the url containing: Twitter.'));
    });

/* ---- Project Code Login Tests ---------------------------- */

    /* Test: Get to project through quick code, enter as guest
        - Path to Edji.it 
        - Enter in valid project code, click join project or hit enter
        - Redirect to “Join” page
        - Click on join as guest field and type in valid not vulgar name hit enter or click join project button
        - Redirect to project
    */
    it('user should be able to get to a project through quick code, enter as guest', () => {

        // Home Page
        browser.wait(home.projectCodeInput.isDisplayed, 5000, ('Never loaded Project Code input box'));
        
        home.enterProjectCode(login.validProjectCode);
        home.clickJoinProjectButton();

        // Join/Login Page
        browser.wait(EC.urlContains("join"), 5000, ('Never arrived at the url containing: "join".'));
        login.enterGuestName(login.testGuestName);
        login.clickGuestLoginButton();

        //Project Page
        browser.wait(EC.urlContains("project"), 5000, ('Never arrived at the url containing: "project".'));
        expect(element(by.id("projectTitle")).isPresent()).toBe(true, 'Could not find the project title.');  //FIND THE TITLE
        
        // Log Out
        sidebar.logOutButton.click();
});

    /* Test: Get to project through quick code, be rejected because of vulgar name
        - Path to Edji.it
        - Enter in valid project code, click join project or hit enter
        - Redirect to “Join” page
        - Click on join as guest field and type in vulgar name hit enter or click join project button
        - Receive “Name is invalid” error message
    */
    it('should be able to get to project through quick code, be rejected because of vulgar name', () => {
        // Home Page
        browser.wait(home.projectCodeInput.isDisplayed, 5000, ('Never loaded Project Code input box'));
        
        home.enterProjectCode(login.validProjectCode);
        home.clickJoinProjectButton();

        // Join / Login Page
        browser.wait(EC.urlContains("join"), 5000, ('Never arrived at the url containing: "join".'));
        login.enterGuestName("Fucking Fucks");
        login.clickGuestLoginButton();
        
        // Lets find that error
        browser.wait(EC.presenceOf(login.msgBadName), 3000, 'The error message should show up. It did not.');
    });

}); // describe 'Home Page'