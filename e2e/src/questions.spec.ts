import * as path from 'path'
import { SideBarComponent } from '../../app/shared/side-bar'
import { browser, by, element, protractor} from 'protractor'
import { NewReading, Login, Sidebar, Project, Questions, Dashboard, Home } from './page-objects'
import { LoginModal, GuestLoginForm } from './components';

/*
    08 Aug 2017
    Last Modified: 10 Aug 2017
    JZ Kyburz

    e2e test the dashboard page - for questions!

    - We log into all types of account.
*/

describe('Reading Questions Tests', () => {

    /* ---- Variable Initialization --------------- */
        
    let newReading  = new NewReading()
    let login       = new Login()
    let sidebar     = new Sidebar()
    let EC          = protractor.ExpectedConditions;
    let project     = new Project();
    let guestForm   = new GuestLoginForm();
    let question    = new Questions();
    let dashboard = new Dashboard();
    let home = new Home();

    // Testing the creation
    describe('Questions - Create', () => {

        beforeAll(() => {
            // Login as test account that we can fill with junk data
            login.getPage()
            browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
            login.enterUsername(login.heroUser)
            login.enterPassword(login.heroPassword)
            browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
            login.loginButton.click()
            browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard")
        });

        afterAll(() => {
            sidebar.logout();
        });

        /* ---- Vital Super Basic Test  --------------- */
        
        /* Test: Extremely Basic Test.
        - IF THIS FAILS: You are not running Protractor correctly;
        */
        it('should see Edji in the title', () => {
            let subject = browser.getTitle()
            let result  = 'Edji'
            browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".')
        });

        /* ---- New Reading Tests wQuestions ------------------------ */

        /* Test: Add a reading with questions
        * 
        */
        it('should add reading with questions when all fields are filled and submitted', () => {
            // Open and wait for New Reading page
            dashboard.openNewReading();

            // Wait for New Reading page
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000, "never found the new reading title");

            // Enter sample Reading into form
            newReading.titleInput.sendKeys(newReading.qTitleString);
            // Make private to avoid needing grade levels and subjecst
            newReading.privateButton.click();
            newReading.contentInput1.sendKeys(newReading.qContentString1);

            // Add the 1st question after all text
            newReading.insertQuestionButtonTap()

            // Input the question prompt
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionPrompt), 5000, "question prompt input never became clickable");
            newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt1);

            // Select the following answer types: 'emoji' & 'text'
            browser.wait(EC.elementToBeClickable(newReading.emojiAnswerButton), 5000, "answer types button never became clickable for the first question");
            newReading.emojiAnswerButton.click();
            newReading.textAnswerButton.click();

            // Enter some more content after we add the question before
            newReading.contentInput2.sendKeys(newReading.qContentString2)

            // Move the cursor over to insert the next question in the middle of text
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)

            // Add another question, but we will add it in the middle of existing text
            newReading.insertQuestionButtonTap()

            // Input the question prompt
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionPrompt), 5000, "question prompt input never became clickable");
            newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt2);

            // Select the following answer types: 'text'
            browser.wait(EC.elementToBeClickable(newReading.emojiAnswerButton), 5000, "answer types button never became clickable for the second question");
            newReading.textAnswerButton.click();

            // Send the input field more text
            newReading.contentInput2.sendKeys(newReading.qContentString2)

            // Add another question, but we will add it in the middle of existing text
            newReading.insertQuestionButtonTap()

            // Remove the last added question
            browser.wait(EC.elementToBeClickable(newReading.questionDelete), 5000, "delete question button never became clickable");
            newReading.questionDelete.click();

            // Make sure we can add a source
            newReading.sourceInput.sendKeys(newReading.qSourceString)

            // Submit New Reading
            newReading.clickShareAndArchive()
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();

            // Should close the reading share code modal after creating a new reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading")

            browser.wait(EC.elementToBeClickable(newReading.shareCodeModalClose), 5000, "reading share code modal never showed up")
            newReading.shareCodeModalClose.click()

            // Reset user to dashboard
            sidebar.backToDash();
        }) // it('should add reading when all fields are filled ...
    }) // describe('Questions - Create'

    describe("Questions: Making Answer Comments", () => {
        beforeAll(() => {
            // Join reply project from the homepage
            home.enterProjectCodeFromHome('questions');          
  
            // Login
             guestForm.loginAsGuest(); // 
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon));
        }); // beforeAll

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon), 5000, "never found the avatar dropdown button");
            sidebar.clickLogOutButton();
        }); // afterAll

        /*
            Test: Make a comment on a question.
        */
        it("should make an emoji and text answer to a question as a guest.", () => {
            // make sure we got there.
            browser.wait(EC.presenceOf(question.testQuestion), 5000, " failed to find the test question!");

            // Skip the tutorial because it gets in the way
            project.skipTutorial();

            // make sure we can see the OpenEndedAnswers block
            browser.wait(EC.presenceOf(question.openEndedAnswerBlock), 10000, "failed to find the open ended answers block under the test question!");
            // browser.executeScript('window.scrollTo(0, document.querySelector("article .button__answer-type").scrollTop + 400);').then(function () {
            //     browser.wait(EC.elementToBeClickable(question.openEndedAnswerBlock), 5000, "never scrolled and saw the question");
            // });

            /**
             * Emoji Answer
             */
            // First, let's find the emoji comment button
            browser.wait(EC.elementToBeClickable(question.emojiCommentBtn), 5000, " failed to click the emoji comment button!");
            // Click on the emoji comment button
            question.emojiCommentBtn.click();
            // Confirm the comment and it's existence
            browser.wait(EC.visibilityOf(question.emojiCommentSave), 5000, " failed to find the comment confirm button!");
            question.emojiCommentSave.click();
            // browser.wait(EC.presenceOf(question.firstAnswer), 5000, " There's supposed to be an emoji answer. This is unacceptable");
            // Make sure the answer options hide after the comment confirms.
            browser.wait(EC.invisibilityOf(question.answerOptions), 5000, " we are seeing the answer options, and we shouldnt!");
            // Delete the comment.
            browser.wait(EC.visibilityOf(question.firstAnswerDelete), 5000, " the emoji delete button never became clickable!");
            question.firstAnswerDelete.click();
            browser.wait(EC.invisibilityOf(question.firstAnswer), 5000, " the comment never deleted! That, or there's a comment in the question for some reason. How about no.");
            // make sure the answer options are visible again
            browser.wait(EC.visibilityOf(question.answerOptions), 5000, " we should be able to see the answer options!");

            /**
             * Text Answer
             */
            
            // and for my next trick, let's find the text comment button
            browser.wait(EC.visibilityOf(question.textCommentBtn), 5000, " failed to find the text comment button!");
            question.textCommentBtn.click();
            browser.wait(EC.visibilityOf(question.textCommentInput), 5000, " failed to find the text comment input!");
            question.textCommentInput.sendKeys("YOU MUST CONSTRUCT ADDITIONAL PYLONS" + protractor.Key.ENTER);
            // Confirm the comment and it's existence
            browser.wait(EC.visibilityOf(question.firstAnswer), 5000, " There's supposed to be a text answer. This is unacceptable");
            // Delete the comment.
            browser.wait(EC.visibilityOf(question.firstAnswerDelete), 5000, " the emoji delete button never became clickable!");
            question.firstAnswerDelete.click();
            browser.wait(EC.invisibilityOf(question.firstAnswer), 5000, " the comment never deleted! That, or there's a comment in the question for some reason. How about no.");
        }); // it("should make an answer to a question as a logged...
    }); //  describe("Questions: Making Answer Comments"
}); // 