import * as path from 'path'
import { SideBarComponent } from '../../app/shared/side-bar'
import { browser, by, element, protractor} from 'protractor'
import { NewReading, Login, Sidebar } from './page-objects'

/*
    08 Aug 2017
    Last Modified: 08 Aug 2017
    JZ Kyburz

    e2e test the dashboard page - for questions!

    - We log into all types of account.
*/

// Now into the testing.
describe('Questions - New', () => {

    /* ---- Variable Initialization --------------- */
    
    let newReading  = new NewReading()
    let login       = new Login()
    let sidebar     = new Sidebar()
    let EC          = protractor.ExpectedConditions

    beforeAll(() => {
        // Login as test account that we can fill with junk data
        login.getPage()
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
        login.enterUsername(login.heroUser)
        login.enterPassword(login.heroPassword)
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
        login.loginButton.click()
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard")
        newReading.getPage()
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
        - 
        - 
        - 
        - 
        - 
        - 
        - 
        - 
    */
    it('should add reading when all fields are filled and submitted', () => {
        // Wait for New Reading page
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)

        // Enter sample Reading into form
        newReading.titleInput.sendKeys(newReading.qTitleString)
        newReading.contentInput1.sendKeys(newReading.qContentString1)

        // Add the 1st question after all text
        browser.wait(EC.elementToBeClickable(newReading.insertQuestionButton), 5000, "insert question button never became clickable");
        newReading.insertQuestionButton.click();

        // Input the question prompt
        browser.wait(EC.elementToBeClickable(newReading.insertQuestionPrompt), 5000, "question prompt input never became clickable");
        newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt1);

        // Select the following answer types: 'emoji' & 'text'
        browser.wait(EC.elementToBeClickable(newReading.emojiAnswerButton), 5000, "answer types button never became clickable");
        newReading.emojiAnswerButton.click();
        newReading.textAnswerButton.click();

        // Enter some more content after we add the question before
        // newReading.contentInput2.sendKeys(newReading.qContentString2)

        // Add another question, but we will add it in the middle of existing text


        // Input the question prompt


        // Select the following answer types: 'text'


        // Verify text made it to the following annotator block


        // Make sure we can add a source
        newReading.sourceInput.sendKeys(newReading.qSourceString)

        // Save from here on to the next z7jzk
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
        // Save up to here this is the final z7jzk in this block
    })
})