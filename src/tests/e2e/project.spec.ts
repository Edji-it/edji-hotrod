import { ProjectService } from '../../app/shared';
import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar } from './page-objects';
import { LoginModal, GuestLoginForm } from './components';

/*
    27 Jan 2017
    Last Modified: 8 Aug 2017
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
    let EC = protractor.ExpectedConditions; // vital
    let guestForm = new GuestLoginForm();
    

    /* ---- beforeEach ---------------------------- */

    // beforeAll(() => {
    //     project.getPage();
    // });

    /* ---- Project Tests ------------------------- */

    /**
     * Test:
     * - Go to a project page
     * - Login with guest name
     * - Make sure that the guest name is on the account button
     */

    describe("Login modal error", () => {
        beforeEach(() => {
            project.getPage();
        });


        loginModal.testLoginModalErrors();
    })

    describe("Login modal success", () => {
        beforeEach(() => {
            project.getPage();
        });

        afterEach(() => {
            // we're going to be logged in on the project page after each of the tests, so log out
            sidebar.logout();
        });

        loginModal.testLoginSuccess(() => {
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "logout button never became clickable");
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
            let grinningEmoji = emojiKeyboard.element(by.css("[dataname=':grinning:'"));

            // Code for making a comment
            // Find text to select
            browser.wait(EC.elementToBeClickable(element(by.css(".w[index='18']"))), 10000, "never found words to click on");

            // Select Text to comment on (should select 'Lorem Ipsum')
            browser.executeScript(function () {
                let range = document.createRange();
                let sel = window.getSelection();
                range.setStart(document.body.querySelector(".w[index='26']").childNodes[0], 0);
                range.setEnd(document.body.querySelector(".w[index='30']").childNodes[0], 0);
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
            project.emojiCommentSave.click();

            // delete the comment
            browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, "could not find delete button");
            project.emojiCommentDelete.click();
        });

        it("should make a comment on an image", () => {
            // Find and click on image
            browser.wait(EC.presenceOf(project.image), 10000, "never found the image");
            browser.executeScript('window.scrollTo(0, document.querySelector("article .img-wrap > img").scrollTop);').then(function () {
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
            browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, "could not find delete button");
            project.emojiCommentDelete.click();

            // make sure it's deleted
            browser.wait(EC.invisibilityOf(project.textComment), 5000, "text comment never went away after deleting it");
        });
    });

    describe("AudioCommenting", () => {
        beforeAll(() => {
            project.getAudioPage();
            // Login
            guestForm.loginAsGuest();
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton));
        });

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
            sidebar.logOutButton.click();
        });

        it("should make audio comment as logged in user", () => {
            // need to navigate to the audio-specific page
        // project.getAudioPage();
            // Code for making an audio comment
            // Find text to select
            browser.wait(EC.elementToBeClickable(element(by.css(".w[index='18']"))), 10000, "never found words to click on");

            // Select Text to comment on (should select 'world is')
            browser.executeScript(function () {
                let range = document.createRange();
                let sel = window.getSelection();
                range.setStart(document.body.querySelector(".w[index='12']").childNodes[0], 0);
                range.setEnd(document.body.querySelector(".w[index='14']").childNodes[0], 0);
                sel.removeAllRanges();
                sel.addRange(range);
            });

            // Add audio comment
            browser.wait(EC.elementToBeClickable(project.addAudioBtn), 5000, "never found the add audio comment button");
            project.addAudioBtn.click();

            // Wait 5 seconds for record button to become clickable and click the record audio button to start recording
            browser.wait(EC.elementToBeClickable(project.audioRecord), 7000, "never found the record audio button");
            project.audioRecord.click();

            // wait 5 seconds for the audio to record
            browser.sleep(5000)

            // click the record audio button to end recording
            browser.wait(EC.elementToBeClickable(project.audioRecord), 7000, "never found the record audio button");
            project.audioRecord.click();

            // wait 5 seconds for the play audio button to become clickable
            browser.wait(EC.elementToBeClickable(project.audioPlay), 5000, "never found the play audio button");
            project.audioPlay.click();

            // wait 5 seconds for the pause button to become active
            browser.wait(EC.elementToBeClickable(project.audioPause), 5000, "could not pause the audio comment");
            project.audioPause.click();

            // wait 5 seconds for the restart button to become active
            browser.wait(EC.elementToBeClickable(project.audioRestart), 5000, "could not restart the audio comment");
            project.audioRestart.click();

            // Delete the audio comment
            browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, "could not find delete button");
            project.commentDelete.click();
            // Needs a second to make sure comment is deleted
            browser.sleep(1000);
        });
    });

    describe("Discussions", () => {
        beforeAll(() => {
            project.getReplyPage();
            // Login
            guestForm.loginAsGuest();
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton));
        });

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
            sidebar.logOutButton.click();
        });

        it("should make a reply comment as a logged in user", () => {
            // need to navigate to the reply-comment page
        // project.getReplyPage();
            // Code for making a reply
            // Wait for text to load
            browser.wait(EC.elementToBeClickable(element(by.css(".w[index='2']"))), 12000, "never found words to click on");
            
            // Wait 5 seconds for the reply button to become clickable and Click on the reply button
            browser.wait(EC.elementToBeClickable(project.existingTextComment), 5000, "never found the existing comment to reply to");
            // project.existingTextComment.click()
            browser.actions().mouseMove(project.existingTextComment).perform();
            browser.wait(EC.elementToBeClickable(project.addReplyBtn), 5000, "never found the add reply comment button");
            project.addReplyBtn.click();

            // Wait 5 seconds for the add text reply button to become clickable and Click on the add text reply button
            browser.wait(EC.elementToBeClickable(project.addTextReplyBtn), 5000, "never found the add text reply comment button");
            
            project.addTextReplyBtn.click();
            browser.sleep(3000);

            // Add text to the text input field
            // browser.wait(EC.elementToBeClickable(project.textReplyComment), 5000, "couldn't add text to the reply text comment");
            browser.actions().sendKeys('some test reply text').perform();
            
            // Blur/Inactivate the reply comment
            browser.wait(EC.elementToBeClickable(project.commentSave), 5000, "could not click the save button on the comment");
            project.commentSave.click();

            // Wait 5 seconds for the delete button to become clickable and then delete the reply comment
            browser.wait(EC.elementToBeClickable(project.replyDelete), 5000, "could not find delete button on the reply comment");
            project.replyDelete.click();

            // Verify the reply comment is gone
            browser.wait(EC.invisibilityOf(project.textReplyComment), 5000, "text reply comment never went away after deleting it");

            // Wait 5 seconds for the dismiss button to become clickable and then click it
            browser.wait(EC.elementToBeClickable(project.dismissReplyPanelBtn), 5000, "never found discussions panel dismiss button");
            project.dismissReplyPanelBtn.click();

            // Verify the discussions panel is dismissed
            browser.wait(EC.invisibilityOf(project.discussionPanel), 5000, "discussion panel never went away after dismissal");
        });
    });
}); // describe 'Dashboard Page'
  