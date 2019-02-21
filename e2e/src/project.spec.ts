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

        it("should make an emoji comment by clicking on words", () => {
            let emojiKeyboard = element(by.css('emoji-keyboard'))
            let grinningEmoji = emojiKeyboard.element(by.css("[dataname=':grinning:']"))
            // Code for making a comment
            // Find text to select
            browser.wait(EC.elementToBeClickable(element(by.css(".w[index='18']"))), 10000, "never found words to click on");
            // Select words using Quick Highlight by clicking
            element(by.css(".w[index='26']")).click()
            element(by.css(".w[index='30']")).click()
            // Add emoji comment
            project.addEmojiComment();
            // Select emojis
            browser.wait(EC.elementToBeClickable(grinningEmoji), 5000, "never found the emoji keyboard");
            grinningEmoji.click();
            emojiKeyboard.element(by.css("[dataname=':heart_eyes:']")).click();
            emojiKeyboard.element(by.css(".emojionearea-filter[title='Objects']")).click();

            // Use emoji keyboard filter, and type an emoji from further down
            browser.wait(EC.elementToBeClickable(emojiKeyboard.element(by.css("[dataname=':dollar:'"))), 5000, "never scrolled to the dollars emoji");
            emojiKeyboard.element(by.css("[dataname=':dollar:']")).click();

            // Save emoji comment
            project.emojiCommentSave.click();

            // delete the comment
            browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, "could not find delete button");
            project.emojiCommentDelete.click();

            // close the comment pane
            browser.wait(EC.elementToBeClickable(project.closePane), 5000, "could not find close pane button");
            project.closePane.click();
        });

        it("should make a comment on an image by clicking on image", () => {
            // Find and click on image
            browser.wait(EC.presenceOf(project.image), 10000, "never found the image");
            browser.executeScript('window.scrollTo(0, document.querySelector("article .img-wrap > img").scrollTop);').then(function () {
                browser.wait(EC.elementToBeClickable(project.image), 5000, "never scrolled and saw the image");
            });
            project.image.click();

            // click the tool tip
            project.addTextComment();

            // add some text to the comment
            browser.wait(EC.presenceOf(element(by.css('textarea.text-comment-input'))), 5000, "couldn't see the text comment");
            browser.actions().sendKeys('test comment').perform();
            // Press ENTER to save 
            browser.actions().sendKeys(protractor.Key.ENTER).perform();
            
            // delete the comment
            browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, "could not find delete button");
            project.emojiCommentDelete.click();

            // make sure it's deleted
            browser.wait(EC.invisibilityOf(element(by.css('textarea.text-comment-input'))), 5000, "text comment never went away after deleting it");

            // close the comment pane
            browser.wait(EC.elementToBeClickable(project.closePane), 5000, "could not find close pane button");
            project.closePane.click();
        });
    });

    describe("AudioCommenting", () => {
        beforeAll(() => {
            // Join project from the homepage
            home.getPage()
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

        it("should make audio comment by selecting text", () => {
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

            // browser.actions().mouseUp(element(by.css(".w[index='14']"))).perform();

            // browser.actions().mouseMove(element(by.css(".w[index='12']"))).mouseDown().mouseMove(element(by.css(".w[index='14']"))).mouseUp().perform();

            // Add audio comment
            project.addAudioComment();

            // Wait 5 seconds for record button to become clickable and click the record audio button to start recording
            browser.wait(EC.elementToBeClickable(project.audioRecord), 7000, "never found the record audio button");
            project.audioRecord.click();

            // wait 3 seconds for the audio to record
            browser.sleep(3000)

            // click the record audio button to end recording
            browser.wait(EC.elementToBeClickable(project.audioRecord), 5000, "never found the record audio button");
            project.audioRecord.click();

            // Wait 5 seconds for the play audio button to become clickable (wait for audio to upload)
            browser.wait(EC.elementToBeClickable(project.audioPlay), 5000, "never found the play audio button");
            project.audioPlay.click();
            
            // // wait 5 seconds for the restart button to become active
            // browser.wait(EC.elementToBeClickable(project.audioRestart), 5000, "could not restart the audio comment");
            // project.audioRestart.click();
            
            // Wait up to 3 seconds for the pause button to become active
            browser.wait(EC.elementToBeClickable(project.audioPause), 3000, "could not pause the audio comment");
            project.audioPause.click();

            // REVISIT: We need to test the restart button
            

            // Delete the audio comment
            browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, "could not find delete button");
            project.commentDelete.click();
            // Verify the audio comment is gone
            browser.wait(EC.invisibilityOf(project.commentDelete), 5000, "audio comment never went away after deleting it");
        });
    });

    describe("Discussions", () => {
        beforeAll(() => {
            // Join reply project from the homepage
            home.getPage()
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
            // Wait 8 seconds for reply pane to render
            browser.wait(EC.elementToBeClickable(project.addReplyBtn), 8000, "never found the add reply comment button");
            project.addReplyBtn.click();

            // Wait 5 seconds for the add text reply button to become clickable and Click on the add text reply button
            browser.wait(EC.elementToBeClickable(project.addTextReplyBtn), 5000, "never found the add text reply comment button");
            project.addTextReplyBtn.click();
            browser.wait(EC.presenceOf(element(by.css('textarea.text-comment-input'))), 5000, "wait for text reply input to show");

            // Add text to the text input field
            // browser.wait(EC.elementToBeClickable(project.textReplyComment), 5000, "couldn't add text to the reply text comment");
            browser.actions().sendKeys('test reply').perform();
            // Press ENTER to save 
            browser.actions().sendKeys(protractor.Key.ENTER).perform();

            // Wait 5 seconds for the delete button to become clickable and then delete the reply comment
            browser.wait(EC.elementToBeClickable(project.replyDelete), 5000, "could not find delete button on the reply comment");
            project.replyDelete.click();

            // Verify the reply comment is gone
            browser.wait(EC.invisibilityOf(project.textReplyComment), 5000, "text reply comment never went away after deleting it");
        });
    });
}); // describe 'Dashboard Page'
  