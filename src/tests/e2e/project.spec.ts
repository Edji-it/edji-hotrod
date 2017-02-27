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

    describe("Commenting", () => {
        beforeAll(() => {
            project.getPage();
            // Login
            guestForm.loginAsGuest();
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton));
        });

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
            sidebar.logOutButton.click();
        });

        it("should make emoji comment as logged in user", () => {

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
        });

        it("should make a comment on an image", () => {
            // Find and click on image
            browser.wait(EC.presenceOf(project.image), 10000, "never found the image");
            browser.executeScript('window.scrollTo(0,10000);').then(function () {
                browser.wait(EC.elementToBeClickable(project.image), 5000, "never scrolled and saw the image");
            });
            project.image.click();

            // click the tool tip
            browser.wait(EC.elementToBeClickable(project.addTextBtn), 5000, "couldn't click the text comment button");
            project.addTextBtn.click();

            // add some text to the comment
            browser.wait(EC.elementToBeClickable(project.textComment), 5000, "couldn't click the text comment");
            project.textComment.sendKeys('some test text');
            
            // save the comment
            browser.wait(EC.elementToBeClickable(project.commentSave), 5000, "could not click the save button on the comment");
            project.commentSave.click();

            // delete the comment
            browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, "could not find delete button");
            project.commentDelete.click();

            // make sure it's deleted
            browser.wait(EC.invisibilityOf(project.textComment), 5000, "text comment never went away after deleting it");
        });
    });


     
}); // describe 'Dashboard Page'
  