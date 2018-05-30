import { browser, by, element, protractor } from 'protractor';

import { Home, Login, Sidebar } from './page-objects';
import { LoginModal } from './components';

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
    let loginModal = new LoginModal();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeEach(() => {
        // home.getPage();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('it should see Edji in the title', () => {
        home.getPage();
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
    // it('user should be able to view guides/FAQ', () => {
    //     browser.wait(EC.elementToBeClickable(home.footerGuidesLink), 5000);
    //     // Verify where link points
    //     expect(home.footerGuidesLink.getAttribute('href')).toContain('guide');
    // });

    /* Test: View Edji twitter page
        - Be on any Edji page except guide.edji.it
        - Click guides button at bottom of page
        - Redirect to Edji twitter page
    */
    it('user should be able to go to the EDJI twitter page', () => {
        browser.wait(EC.elementToBeClickable(home.footerTwitterLink), 5000);
        // Verify where link points
        expect(home.footerTwitterLink.getAttribute('href')).toContain('twitter');
    });

    /* Test: Linking to Terms in footer
    */
    it('user should be able to go to the EDJI Terms page', () => {
        browser.wait(EC.elementToBeClickable(home.footerTermsLink), 5000);
        // Verify where link points
        expect(home.footerTermsLink.getAttribute('href')).toContain('terms');
    });

/* ---- Project Code Login Tests ---------------------------- */

    /* Test: Get to project through quick code, enter as guest
        - Path to Edji.it 
        - Enter in valid project code, click join project or hit enter
        - Redirect to “Join” page
        - Click on join as guest field and type in valid not vulgar name hit enter or click join project button
        - Redirect to project
    */
    // it('user should be able to get to a project through quick code, enter as guest', () => {

    //     // Home Page
    //     browser.wait(home.projectCodeInput.isDisplayed, 5000, ('Never loaded Project Code input box'));
        
    //     home.enterProjectCode(login.validProjectCode);
    //     home.clickJoinProjectButton();

    //     // Get to Project Page
    //     browser.wait(EC.urlContains("project"), 5000, ('Never arrived at the url containing: "project".'));

    //     // Make sure they see guest modal
    //     browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton));
    //     expect(loginModal.gotoAccountLoginButton.isPresent()).toBeTruthy();
        
    //     // Join as guest
    //     browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, "never saw a guest name input box");
    //     loginModal.guestNameInput.sendKeys("Guest");
    //     browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, "never found the guest login button");
    //     loginModal.guestLoginButton.click();

    //     // log out
    //     sidebar.clickLogOutButton();
    // });

}); // describe 'Home Page'