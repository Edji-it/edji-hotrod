import { browser, by, element, protractor } from 'protractor';

import { Project, Sidebar, Home } from './page-objects';
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
    let home = new Home();
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

    describe("Login modal errors", () => {
        home.getPage();
        // Go to project to see login modal
        home.enterProjectCodeFromHome('test')
        loginModal.testLoginModalErrors()
    })

    describe("Commenting", () => {
        beforeAll(() => {
            // Should start on the homepage each time
            home.getPage()
            home.enterProjectCodeFromHome('test')
            // Login
            guestForm.loginAsGuest()
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
        });

        afterAll(() => {
            sidebar.logout();
        });

        it("should make an emoji comment", () => {

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

            browser.actions().mouseUp(element(by.css(".w[index='21']"))).perform();

            // browser.actions().mouseMove(element(by.css(".w[index='18']"))).mouseDown().mouseMove(element(by.css(".w[index='21']"))).mouseUp().perform();

            // Add emoji comment
            project.addEmojiComment();

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

            // close the comment pane
            browser.wait(EC.elementToBeClickable(project.closePane), 5000, "could not find close pane button");
            project.closePane.click();
        });

        it("should make a comment on an image", () => {
            // Find and click on image
            browser.wait(EC.presenceOf(project.image), 10000, "never found the image");
            browser.executeScript('window.scrollTo(0, document.querySelector("article .img-wrap > img").scrollTop);').then(function () {
                browser.wait(EC.elementToBeClickable(project.image), 5000, "never scrolled and saw the image");
            });
            project.image.click();

            // click the tool tip
            project.addTextComment();

            // add some text to the comment
            browser.wait(EC.elementToBeClickable(project.textComment), 5000, "couldn't click the text comment");
            project.textComment.sendKeys('some test text');
            
            // save the comment
            browser.wait(EC.elementToBeClickable(project.emojiCommentSave), 5000, "could not click the save button on the comment");
            project.emojiCommentSave.click();

            // delete the comment
            browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, "could not find delete button");
            project.emojiCommentDelete.click();

            // make sure it's deleted
            browser.wait(EC.invisibilityOf(project.textComment), 5000, "text comment never went away after deleting it");

            // close the comment pane
            browser.wait(EC.elementToBeClickable(project.closePane), 5000, "could not find close pane button");
            project.closePane.click();
        });
    });

    describe("AudioCommenting", () => {
        beforeAll(() => {
            // Join project from the homepage
            home.enterProjectCodeFromHome('audio');
            // Login
            guestForm.loginAsGuest();
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon));
        });

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon), 5000, "never found the avatar dropdown button");
            sidebar.clickLogOutButton();
        });

        it("should make audio comment as logged in user", () => {
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

            browser.actions().mouseUp(element(by.css(".w[index='14']"))).perform();

            // browser.actions().mouseMove(element(by.css(".w[index='12']"))).mouseDown().mouseMove(element(by.css(".w[index='14']"))).mouseUp().perform();

            // Add audio comment
            project.addAudioComment();

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

            // REVISIT: We need to test the restart button
            // // wait 5 seconds for the restart button to become active
            // browser.wait(EC.elementToBeClickable(project.audioRestart), 5000, "could not restart the audio comment");
            // project.audioRestart.click();

            // Delete the audio comment
            browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, "could not find delete button");
            project.commentDelete.click();
            // Needs a second to make sure comment is deleted
            browser.sleep(1000);
        });
    });

    describe("Discussions", () => {
        beforeAll(() => {
            // Join reply project from the homepage
            home.enterProjectCodeFromHome('reply');
            // Login
            guestForm.loginAsGuest();
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon));
        });

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon), 5000, "never found the avatar dropdown button");
            sidebar.clickLogOutButton();
        });

        it("should make a reply comment as a logged in user", () => {
            // Wait for text to load
            browser.wait(EC.elementToBeClickable(element(by.css(".w[index='2']"))), 12000, "never found words to click on");

            // Wait 5 seconds for the avatar with a reply to become clickable
            project.openReplyPane()
            
            browser.wait(EC.elementToBeClickable(project.addReplyBtn), 5000, "never found the add reply comment button");
            project.addReplyBtn.click();

            // Wait 5 seconds for the discussions pane to open
            browser.wait(EC.visibilityOf(project.discussionsPane), 5000, "discussions pane never opened");
            // Wait 5 seconds for the add text reply button to become clickable and Click on the add text reply button
            browser.wait(EC.elementToBeClickable(project.addTextReplyBtn), 5000, "never found the add text reply comment button");
            
            // This lil browser sleep trick avoids issues where the add text reply button is intermittently unavailable on load
            browser.sleep(1000);
            project.addTextReplyBtn.click();
            browser.sleep(1000);
            browser.wait(EC.elementToBeClickable(element(by.css('textarea.text-comment-input'))), 5000, "wait for text reply input to show");

            // Add text to the text input field
            // browser.wait(EC.elementToBeClickable(project.textReplyComment), 5000, "couldn't add text to the reply text comment");
            browser.actions().sendKeys('some test reply text').perform();
            // Press ENTER to save 
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

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
  