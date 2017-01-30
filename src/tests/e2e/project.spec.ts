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
describe('Project Page As Guest', () => {

    /* ---- Variable Initialization --------------- */
    let project = new Project();
    let loginModal = new LoginModal();
    let sidebar = new Sidebar();
    let EC      = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        project.getPage();
        
        // clears all the storage so that we will always get guest login modal
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
    });

    /* ---- Project Tests ------------------------- */

    /**
     * Test:
     * - Go to a project page
     */

    it("it should login as a guest", () => {
        // browser.waitForAngular();
        // console.log("waiting...");
        // browser.wait(EC.elementToBeClickable(project.gotoAccountLoginButton), 5000);
        // project.gotoAccountLoginButton.click();
        // console.log("just clicked");
        // project.guestNameInput.sendKeys("corbin");
        // expect(project.guestNameInput.getText()).toBe("corbin");

        // console.log(project.guestLoginHeader.getText());
        expect(loginModal.guestLoginHeader.isPresent()).toBeTruthy();
        expect(loginModal.guestNameInput.getText()).toBe("");
        loginModal.guestNameInput.sendKeys(loginModal.guestLogin);
        browser.wait(EC.elementToBeClickable(loginModal.guestLoginButton), 5000);
        loginModal.guestLoginButton.click();

        browser.wait(EC.elementToBeClickable(sidebar.accountButton), 5000);
        expect(sidebar.dumb.getText()).toBe(loginModal.guestLogin);

        // browser.sleep(1000);
        // project.gotoAccountLoginButton.click();
        // expect(project.accountLoginHeader.getText()).toBe("Edji with your very own account");
        // expect(project.guestNameInput.getText()).toBe("corbin");
    })
     
}); // describe 'Dashboard Page'
  