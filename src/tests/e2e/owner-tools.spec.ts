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
describe('Project Page as a Project Owner: ', () => {

    /* ---- Variable Initialization --------------- */
    let project = new Project();
    let loginModal = new LoginModal();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        // Id for Owner Tools Test Reading owned by Teach/Teach
        browser.get("/#/project/hjb2");
    });

    /* ---- Project Tests ------------------------- */

    it("should toggle on Heat Vision as Project Owner", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, "never found button to go to account login");
        loginModal.gotoAccountLoginButton.click();
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy();
        loginModal.usernameInput.sendKeys('testowner');
        loginModal.passwordInput.sendKeys('testowner16');
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, "never found the account login button on modal");
        
        loginModal.accountLoginButton.submit();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.heatButton), 5000, "never found the heat vision button");
        
        // Conditionally toggle the Heat Vision to make Active
        sidebar.heatButton.getAttribute('class').then(classes => {
            if (classes.indexOf('inactive') > 0) {
                sidebar.heatButton.click();
            }
        });

        browser.sleep(2000);
        expect(sidebar.heatButton.getAttribute('class')).toContain("active");

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */
    it("show other user's comment to guest while Heat Vision is on", () => {
        // logging in
        browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, "never saw a guest name input box");
        loginModal.guestNameInput.sendKeys("Hot Commenter");
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, "never found the guest login button");
        loginModal.guestLoginButton.click();

        
        // Make sure the comment was created
        let comments = element.all(by.css('edji-comment:not(.hidden):not(.owner)'));
        browser.wait(EC.elementToBeClickable(comments.first()), 5000, "never found the added comment");
        expect(comments.count()).toBeGreaterThan(0);

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });

    it("should toggle off Heat Vision as Project Owner", () => {
        // initial validation
        browser.wait(EC.presenceOf(loginModal.guestLoginHeader), 5000, "never saw the login modal's header");
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.accountLoginHeader.isPresent()).toBeFalsy();

        // switch to login section and validate
        browser.wait(EC.elementToBeClickable(loginModal.gotoAccountLoginButton), 5000, "never found button to go to account login");
        loginModal.gotoAccountLoginButton.click();
        expect(loginModal.accountLoginHeader.isPresent()).toBeTruthy();
        loginModal.usernameInput.sendKeys('testowner');
        loginModal.passwordInput.sendKeys('testowner16');
        browser.wait(EC.elementToBeClickable(loginModal.accountLoginButton), 5000, "never found the account login button on modal");
        
        loginModal.accountLoginButton.submit();

        // account button validation
        browser.wait(EC.elementToBeClickable(sidebar.heatButton), 5000, "never found the heat vision button on the sidebar");
        
        // Conditionally toggle the Heat Vision to make Active
        sidebar.heatButton.getAttribute('class').then(classes => {
            if (classes.indexOf('inactive') < 1) {
                sidebar.heatButton.click();
            }
        });

        browser.sleep(2000);
        expect(sidebar.heatButton.getAttribute('class')).toContain("inactive");

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */
    it("hide other user's comments to guest while Heat Vision is on", () => {
        // logging in
        browser.wait(EC.elementToBeClickable(loginModal.guestNameInput), 6000, "never saw a guest name input box");
        loginModal.guestNameInput.sendKeys("Not Hot Commenter");
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000, "never found the guest login button");
        loginModal.guestLoginButton.click();

        
        // Make sure the comment was created
        let comments = element.all(by.css('edji-comment:not(.hidden):not(.owner)'));
        expect(comments.count()).toBe(0);

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });    
     
}); // describe 'Dashboard Page'
  