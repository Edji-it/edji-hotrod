import { browser, by, element, protractor } from 'protractor';
import { Account, Login } from './page-objects';
/*
    27 Jan 2017
    Last Modified: 3 July 2017
    Nicholas Pumper

    e2e test the account page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Account Page', () => {

    /* ---- Variable Initialization --------------- */
    
    // object references
    let EC = protractor.ExpectedConditions; // vital
    let account = new Account();
    let login = new Login();

    // other variables
    let testAvatarToUpload = '../../assets/test-avatar/shia.jpg';

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeAll(() => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterUsername(login.botUser);
        login.enterPassword(login.botPassword);
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.loginButton.click();
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");
        account.getPage();
    }); // beforeAll

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    // Created 7.3.17
    describe('Avatars', () => {

        // 7.3.17
        it('Avatar picture should not be visible, and user initials should be instead', () => {
            // make sure there is no avatar
            browser.wait(EC.invisibilityOf(account.avatarImg), 5000, "should not be able to see the avatar image");
            browser.wait(EC.visibilityOf(account.userInitials), 5000, "should be able to see the user initials");
        });

        describe('Changing Avatars', () => {
            it('Clicking "Cancel" on the modal should not set an avatar', () => {
            // Make sure there is no avatar
            browser.wait(EC.invisibilityOf(account.avatarImg), 2000, "should not be able to see the avatar image");
           
            // open the upload modal
            browser.wait(EC.presenceOf(account.editBtn), 5000, "should be able to see the edit button");
            account.editBtn.click();

            // In the modal...
            browser.wait(EC.visibilityOf(account.avatarModal), 5000, "should be able to see the upload avatar modal.");
            browser.wait(EC.presenceOf(account.cancelUploadBtn), 5000, "should be able to see the cancel upload button.");
            account.cancelUploadBtn.click();

            // I want to see the modal gone like my ex-wife
            browser.wait(EC.invisibilityOf(account.avatarModal), 5000, "should not be able to see the upload avatar modal.");
            browser.wait(EC.visibilityOf(account.avatarModal), 5000, "should not be able to see the upload avatar modal.");
        });
        }); // describe Changing Avatars
    }); // describe('Avatars', 
}); // describe 'Account Page'