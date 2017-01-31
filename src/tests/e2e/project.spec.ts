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
describe('Project Page as Guest:', () => {

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
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginHeader), 5000);
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // logging in
        loginModal.guestNameInput.sendKeys(loginModal.guestLogin);
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000);
        loginModal.guestLoginButton.click();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.accountButton), 5000);
        expect(sidebar.accountButtonSpan.getText()).toBe(loginModal.guestLogin);

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000);
        sidebar.logOutButton.click();
    });

    it("it should login as a user with an account", () => {
        // initial validation
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginHeader), 5000);
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000);
        loginModal.gotoAccountLoginButton.click();
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy();
        loginModal.usernameInput.sendKeys(loginModal.username);
        loginModal.passwordInput.sendKeys(loginModal.password);
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000);
        
        // loginModal.accountLoginButton.click();
        
        loginModal.accountLoginButton.submit();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.accountButton), 5000);
        expect(sidebar.accountButtonSpan.getText()).toBe("student");

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000);
        sidebar.logOutButton.click();
    });
     
}); // describe 'Dashboard Page'
  