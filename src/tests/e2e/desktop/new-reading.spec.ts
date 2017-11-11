import * as path from 'path';
import { SideBarComponent } from '../../app/shared/side-bar';
import { browser, by, element, protractor} from 'protractor';
import { NewReading, Login, Sidebar } from '../page-objects';

/*
    27 Jan 2017
    Last Modified: 27 Jan 2017
    Nicholas Pumper

    e2e test the dashboard page!

    - We log into all types of account.
*/

// Now into the testing.
describe('New Reading Page', () => {

    /* ---- Variable Initialization --------------- */
    
    let newReading  = new NewReading();
    let login       = new Login();
    let sidebar     = new Sidebar();
    let EC          = protractor.ExpectedConditions;

    beforeAll(() => {
        // Login as test account that we can fill with junk data
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterUsername(login.botUser);
        login.enterPassword(login.botPassword);
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.loginButton.click();
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");
    });

    afterAll(() => {
        sidebar.logout();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('should see Edji in the title', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    /* ---- New Reading Tests ------------------------ */

    /* Test: Add a reading
        - Go to Teacher Dashboard
        - Click add a reading button
        - Redirect to Add a Reading page
        - Click on new title box and Enter title
        - Tab/click to source url, enter URL
        - Tab/click to contact, paste content or type in content
        - Tab and hit enter/ click on “Add reading button”
        - Redirect to reading page of newly created reading
    */
    it('should add reading when all fields are filled and submitted', () => {
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading into form
        newReading.titleInput.sendKeys(newReading.titleString);
        newReading.contentInput.sendKeys(newReading.contentString);
        newReading.sourceInput.sendKeys(newReading.sourceString);

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "save reading button never became clickable after content add");
        newReading.addButton.click();
        
        // Group Label has content prefilled, so we clear it
        newReading.groupInput.clear();
        newReading.groupInput.sendKeys(newReading.groupString);

        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
        newReading.finalizeButton.click();

        // // Click the 'Go to Reading' button on share button modal
        // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
        // newReading.goToReadingButton.click();

        // Should redirect to Project page for new reading
        browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");
    });


    /* Test: Add reading, don’t enter title and see error
        - Open New Reading page
        - Fill all fields *but* title
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading a title
    */
    it('should display an error if the title is not filled', () => {
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading into form, excluding title
        newReading.titleInput.clear();
        newReading.contentInput.sendKeys(newReading.contentShortString);
        newReading.sourceInput.sendKeys(newReading.sourceString);

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "save reading button never became clickable after content add");
        //newReading.addButton.submit();
        newReading.addButton.click();
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
        newReading.finalizeButton.click();

        // Should see error for empty title
        browser.wait(EC.presenceOf(newReading.titleError), 5000, "never saw an error for empty title");
    });

     /* Test: Add reading, don’t enter content and see error
        - Open New Reading page
        - Fill all fields *but* content
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading content
    */
    it('should display an error if no content is entered', () => {
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading data into form, but clear content
        newReading.titleInput.sendKeys(newReading.titleString);
        newReading.contentInput.clear();
        newReading.sourceInput.sendKeys(newReading.sourceString);

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "save reading button never became clickable after content add");
        //newReading.addButton.submit();
        newReading.addButton.click();
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
        newReading.finalizeButton.click();

        // Should see error for empty content
        browser.wait(EC.presenceOf(newReading.contentError), 5000, "never saw an error for empty content");
    });

    /* Test: Add reading, but clear Group Label and see error
        - Open New Reading page
        - Fill all fields *but* group label
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading a group label
    */
    it('should display an error if no group label is entered', () => {
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading into form, but clear group label
        newReading.titleInput.sendKeys(newReading.titleString);
        newReading.contentInput.sendKeys(newReading.contentShortString);
        newReading.sourceInput.sendKeys(newReading.sourceString);

        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "save reading button never became clickable after content add");
        newReading.addButton.click();

        browser.wait(EC.elementToBeClickable(newReading.groupInput), 5000, "group input became clickable");
        newReading.groupInput.clear();
        // This field needs special attention to trigger the required
        newReading.groupInput.sendKeys(' ');
        newReading.groupInput.sendKeys(protractor.Key.BACK_SPACE); 

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "save reading button never became clickable after content add");
        newReading.finalizeButton.click();
        
        // Should see error for empty group label
        browser.wait(EC.presenceOf(newReading.groupError), 5000, "never saw an error for empty group label");
    });

    /* Test: Upload a PDF and create a Reading with
        - Open New Reading page
        - Open PDF upload modal
        - Select and upload a PDF
        - Insert PDF into the Reading
        - Create the Reading
    */
    describe("PDF upload", () => {
        /**
         * Test: Add reading with pages from a PDF
         */
        it('should upload a PDF to a reading and save it to the reading', function() {
            // Open and wait for New Reading page
            newReading.getPage();
            browser.wait(EC.elementToBeClickable(newReading.uploadPDfModalButton), 5000);
            newReading.uploadPDfModalButton.click();
            
            // Select File to upload
            let fileToUpload = '../../../assets/test/2-pages.pdf';
            let absolutePath = path.resolve(__dirname, fileToUpload);
            newReading.pdfFileInput.sendKeys(absolutePath);

            // Begin upload 
            browser.wait(EC.elementToBeClickable(newReading.pdfUploadTrigger), 10000, "button to upload a PDF never became clickable");
            newReading.pdfUploadTrigger.click();

            // Image was uploaded! Insert it
            browser.wait(EC.elementToBeClickable(newReading.insertUploadedPdf), 20000, "the pdf never became available to insert");
            newReading.insertUploadedPdf.click();

            // Complete rest of reading
            newReading.titleInput.sendKeys(newReading.titleImageString);

            // Submit New Reading
            browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "add new reading button never became clickable");
            newReading.addButton.click();
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();

            // // Click the 'Go to Reading' button on share button modal
            // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
            // newReading.goToReadingButton.click();

            // Should create a new Reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");

            // Should see image in new reading
            browser.wait(EC.presenceOf(newReading.imageInReading), 10000, "never saw PDF in the new reading");
        });

        // This following test relies on the previous one for a PDF to delete.
        it('should delete a PDF that was uploaded', function() {
           // Open and wait for New Reading page
            newReading.getPage();
            browser.wait(EC.elementToBeClickable(newReading.uploadPDfModalButton), 5000);
            newReading.uploadPDfModalButton.click();
           
            // Click the delete button
            let allPdfCards = element.all(by.id("titleCard"));
            let pdfCard = element(by.id("titleCard"));

            let delBtn = element(by.id("pdfDelBtn"));
            let confirmDelBtn = element(by.id("pdfDelBtnConfirm"));

            browser.wait(EC.elementToBeClickable(delBtn), 5000, "delBtn never became clickable");
            delBtn.click();

            browser.wait(EC.elementToBeClickable(confirmDelBtn), 5000, "confirm delete button never became clickable");
            confirmDelBtn.click();

            // TO-DO: We've had issues tracking this via count
            // browser.wait(EC.invisibilityOf(delBtn), 5000, 'delete button should not be visible.');
        });
    });

    describe("Image upload", () => {
        /**
         * Test: Add reading with an image
         */
        it('should upload an image to a reading and save it to the reading', function() {
            // Open and wait for New Reading page
            newReading.getPage();
            browser.wait(EC.elementToBeClickable(newReading.uploadModalButton), 5000, "image upload modal button never became clickable");
            newReading.uploadModalButton.click();
            browser.wait(EC.elementToBeClickable(newReading.imageUploadTrigger), 6000, "image upload trigger never became clickable");
            
            // Select File to upload
            let fileToUpload = '../../../assets/test/titration.jpg';
            let absolutePath = path.resolve(__dirname, fileToUpload);
            newReading.imageFileInput.sendKeys(absolutePath);

            // Begin upload 
            browser.wait(EC.elementToBeClickable(newReading.imageUploadTrigger), 5000, "button to upload an image never became clickable");
            newReading.imageUploadTrigger.click();

            // Image was uploaded! Insert it
            browser.wait(EC.elementToBeClickable(newReading.uploadedImage), 10000, "never saw the image uploaded");
            newReading.uploadedImage.click();

            // Complete rest of reading
            newReading.titleInput.sendKeys(newReading.titleImageString);

            // Submit New Reading
            browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "login button never became clickable after login form entry");
            //newReading.addButton.submit();
            newReading.addButton.click();
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();

            // // Click the 'Go to Reading' button on share button modal
            // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
            // newReading.goToReadingButton.click();

            // Should create a new Reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");

            // Should see image in new reading
            browser.wait(EC.presenceOf(newReading.imageInReading), 10000, "never saw an image in the new reading");
        });
    });

    describe("Reading draft", () => {
        /**
         * Test: Add reading as a draft
            - Click on new title box and Enter title
            - Tab/click to source url, enter URL
            - Tab/click to contact, paste content or type in content
            - Click on "Save as Draft" button
            - Make sure the success alert shows up
            - Check to make sure the returned content matches what went in
            - Click on “Publish” button
            - Redirect to reading page of newly created reading
         */
        it('should add a reading as a draft and return to the same screen with a reading id', function() {
            // Open and wait for New Reading page
            newReading.getPage();
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

            // Enter sample Reading into form
            newReading.titleInput.sendKeys(newReading.titleString);
            newReading.contentInput.sendKeys(newReading.contentShortString);
            newReading.sourceInput.sendKeys(newReading.sourceString);

            // Submit New Draft for Reading
            browser.wait(EC.elementToBeClickable(newReading.draftButton), 5000, "add draft button never became clickable after form entry");
            newReading.draftButton.click();

            // Draft should be created in this block
            // Should redirect to new reading page with same inputs and a success alert
            browser.wait(EC.urlContains("new-reading"), 5000, "never created the draft");
            browser.wait(EC.presenceOf(newReading.successAlert), 5000, "never saw the success alert");

            // Add more text
            newReading.contentInput.sendKeys(newReading.contentShortStringB);

            // Submit New Reading
            browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "add new reading button never became clickable");
            newReading.addButton.click();
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();

            // // Click the 'Go to Reading' button on share button modal
            // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
            // newReading.goToReadingButton.click();

            // Should create a new Reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");
        });
    });

    /* Test: Add reading, then adjust with editing buttons. (Headers, bold, underlines, italixs, text size)
        - Log in with Teacher account
        - Arrive at Dashboard
        - Add reading content.
        - Adjust editing buttons.
        - Click Add Reading
    */

}); // describe 'Account Page'