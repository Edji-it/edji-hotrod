import * as path from 'path'
import { SideBarComponent } from '../../app/shared/side-bar'
import { browser, by, element, protractor} from 'protractor'
import { NewReading, Login, Sidebar, Project, Questions } from './page-objects'
import { LoginModal, GuestLoginForm } from './components';

/*
    08 Aug 2017
    Last Modified: 08 Aug 2017
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
        it('should add reading when all fields are filled and submitted', () => {
            newReading.getPage()
            // Wait for New Reading page
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000, "never found the new reading title");

            // Enter sample Reading into form
            newReading.titleInput.sendKeys(newReading.qTitleString);
            newReading.contentInput1.sendKeys(newReading.qContentString1);

            // Add the 1st question after all text
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionButton), 5000, "insert question button never became clickable");
            newReading.insertQuestionButton.click();

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
            newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)

            // Add another question, but we will add it in the middle of existing text
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionButton), 5000, "insert question button never became clickable again");
            newReading.insertQuestionButton.click();

            // Input the question prompt
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionPrompt), 5000, "question prompt input never became clickable");
            newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt2);

            // Select the following answer types: 'text'
            browser.wait(EC.elementToBeClickable(newReading.emojiAnswerButton), 5000, "answer types button never became clickable for the second question");
            newReading.textAnswerButton.click();

            // Send the input field more text
            newReading.contentInput2.sendKeys(newReading.qContentString2)

            // Add another question, but we will add it in the middle of existing text
            browser.wait(EC.elementToBeClickable(newReading.insertQuestionButton), 5000, "insert question button never became clickable again for third time");
            newReading.insertQuestionButton.click();

            // Remove the last added question
            browser.wait(EC.elementToBeClickable(newReading.questionDelete), 5000, "delete question button never became clickable");
            newReading.questionDelete.click();

            // Verify text made it to the following annotator block


            // Make sure we can add a source
            newReading.sourceInput.sendKeys(newReading.qSourceString)

            // Submit New Reading
            browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "save reading button never became clickable after content add")
            newReading.addButton.click()
            
            // Group Label has content prefilled, so we clear it
            newReading.groupInput.clear()
            newReading.groupInput.sendKeys(newReading.groupString)

            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable")
            newReading.finalizeButton.click()

            // Should redirect to Project page for new reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading")
        }) // it('should add reading when all fields are filled ...
    }) // describe('Questions - Create'

    describe("Questions: Making Answer Comments", () => {
        beforeAll(() => {
            question.getPage();            
  
            // Login
             guestForm.loginAsGuest(); // 
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton));
        }); // beforeAll

        afterAll(() => {
            // log out
            browser.wait(EC.elementToBeClickable(sidebar.logOutButton), 5000, "never found the logout button");
            sidebar.logOutButton.click();
        }); // afterAll

        /*
            Test: Make a comment on a question.
        */
        it("should make an answer to a question as a logged in user.", () => {
            // make sure we got there.
            browser.wait(EC.presenceOf(question.testQuestion), 5000, " failed to find the test question!");

            // make sure we can see the OpenEndedAnswers block
            browser.wait(EC.visibilityOf(question.openEndedAnswerBlock), 5000, " failed to find the open ended answers block under the test question.!");
                
            // First, let's find the emoji comment button
            browser.wait(EC.elementToBeClickable(question.emojiCommentBtn), 5000, " failed to clicj the emoji comment button!");

            // Click on the emoji comment button
            question.emojiCommentBtn.click();

            // now lets see if the input is showing up
            browser.wait(EC.invisibilityOf(question.emojiCommentInput), 5000, " failed to find the emoji comment input!");

            // Confirm the comment and it's existence
            browser.wait(EC.visibilityOf(question.emojiCommentSave), 5000, " failed to find the comment confirm button!");
            question.emojiCommentSave.click();

            // Make sure the answer options hide after the comment confirms.
            browser.wait(EC.invisibilityOf(question.answerOptions), 5000, " we are seeing the answer options, and we shouldnt!");

            // Delete the comment.


            // and for my next trick, let's find the text comment button
            // browser.wait(EC.presenceOf(question.textCommentBtn), 5000, " failed to find the text comment button!");
            
            // Click on the text comment button

            // Confirm the comment and it's existence

            // Delete the comment.

            // and for my next trick, let's find the audio comment button
            
            // Click on the text comment button

            // Confirm the comment and it's existence

            // Delete the comment.

            // FINAL STEP: Make sure there are no comments remaining, and that the answer options are showing.

        }); // it("should make an answer to a question as a logged...
    }); //  describe("Questions: Making Answer Comments"
}); // d