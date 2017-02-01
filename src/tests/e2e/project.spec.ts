import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar } from './page-objects';
import { LoginModal } from './components';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the Project page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Project Page without a login: ', () => {

    /* ---- Variable Initialization --------------- */
    let project = new Project();
    let loginModal = new LoginModal();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        project.getPage();
        
        // clears all the storage so that we will always get guest login modal
    });

    /* ---- Project Tests ------------------------- */

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */

    it("it should login as a guest", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // logging in
        loginModal.guestNameInput.sendKeys(loginModal.guestLogin);
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, "never found the guest login button");
        loginModal.guestLoginButton.click();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.accountButton), 5000, "never found the account button on the sidebar");
        expect(sidebar.accountButtonSpan.getText()).toBe(loginModal.guestLogin);

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });

    it("it should be rejected for a vulgar guest name", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // enter vulgar name and submit to guest login
        loginModal.guestNameInput.sendKeys("Fucking Fucks");
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, "guest login button never became clickable");
        loginModal.guestLoginButton.click();

        // validate error
        browser.wait(EC.presenceOf(loginModal.guestBadNameErr));
    });

    it("it should login as a user with an account", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, "never found button to go to account login");
        loginModal.gotoAccountLoginButton.click();
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy();
        loginModal.usernameInput.sendKeys(loginModal.username);
        loginModal.passwordInput.sendKeys(loginModal.password);
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, "never found the account login button on modal");
        
        // loginModal.accountLoginButton.click();
        
        loginModal.accountLoginButton.submit();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.accountButton), 5000, "never found the account button on the sidebar");
        expect(sidebar.accountButtonSpan.getText()).toBe("student");

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });
     
}); // describe 'Dashboard Page'
  