import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar } from './page-objects';
import { LoginModal, GuestLoginForm } from './components';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the Project page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Project Page', () => {

    /* ---- Variable Initialization --------------- */
    let project = new Project();
    let sidebar = new Sidebar();
    let loginModal = new LoginModal();
    let EC      = protractor.ExpectedConditions; // vital
    let guestForm = new GuestLoginForm();
    

    /* ---- beforeEach ---------------------------- */

    beforeEach(() => {
        project.getPage();
    });

    /* ---- Project Tests ------------------------- */

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */

    loginModal.testLoginModalErrors();

    describe("Login modal success", () => {
        afterEach(() => {
            // we're going to be logged in on the project page after each of the tests, so log out
            sidebar.logout();
        });

        loginModal.testLoginSuccess(() => {
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton));
        });
    });

    it("should make emoji comment as logged in user", () => {
        // Login 
        guestForm.loginAsGuest();
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton));

        let emojiKeyboard = element(by.css('emoji-keyboard'));
        let emojiCommentSave = element(by.css('.comment.active .comment__save'));
        let grinningEmoji = emojiKeyboard.element(by.css("[dataname=':grinning:'"));

        // Code for making a comment
        // Find text to select
        browser.wait(EC.elementToBeClickable(element(by.css(".word[index='18']"))), 5000, "never found words to click on");

        // Select Text to comment on (should select 'Lorem Ipsum')
        browser.executeScript(function () {
            let range = document.createRange();
            let sel = window.getSelection();
            range.setStart(document.body.querySelector(".word[index='18']").childNodes[0], 0);
            range.setEnd(document.body.querySelector(".word[index='21']").childNodes[0], 0);
            sel.removeAllRanges();
            sel.addRange(range);
        });

        // Add emoji comment
        browser.wait(EC.elementToBeClickable(project.addEmojiBtn), 5000, "never found the add emoji comment button");
        project.addEmojiBtn.click();

        // Type emojis
        browser.wait(EC.elementToBeClickable(grinningEmoji), 5000, "never found the emoji keyboard");
        grinningEmoji.click();
        emojiKeyboard.element(by.css("[dataname=':heart_eyes:'")).click();
        emojiKeyboard.element(by.css(".emojionearea-filter[title='Objects']")).click();

        // Use emoji keyboard filter, and type an emoji from further down
        browser.wait(EC.elementToBeClickable(emojiKeyboard.element(by.css("[dataname=':dollar:'"))), 5000, "never scrolled to the dollars emoji");
        emojiKeyboard.element(by.css("[dataname=':dollar:'")).click();

        // Save emoji comment
        emojiCommentSave.click();

        // log out
        browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
        sidebar.logOutButton.click();
    });
     
}); // describe 'Dashboard Page'
  