import { browser, by, element, protractor } from 'protractor';
import { Account } from './page-objects';
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
    
    let EC = protractor.ExpectedConditions; // vital
    let account = new Account();

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeEach(() => {
        account.getPage();
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

    it('Avatar picture should not be visible, and user initials should be instead', () => {
        
        browser.wait(EC.presenceOf(account.avatarImg), 5000, "should not be able to see the avatar image");
        browser.wait(EC.visibilityOf(account.userInitials), 2000, "should be able to see the user initials");
    });

    describe('Changing Avatars', () => {
        it('Clicking "Cancel" on the modal should not set an avatar', () => {
            browser.wait(EC.presenceOf(account.editBtn), 2000, "should not be able to see the avatar image");
            account.editBtn.click();
        });
            
    });
}); // describe 'Account Page'f