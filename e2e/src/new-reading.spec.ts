import * as path from 'path'
import { browser, by, element, protractor} from 'protractor'
import { NewReading, Login, Sidebar, Dashboard } from './page-objects'

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
    
    let newReading  = new NewReading()
    let login       = new Login()
    let sidebar     = new Sidebar()
    let dashboard = new Dashboard()
    let EC          = protractor.ExpectedConditions

    beforeAll(() => {
        // Login as test account that we can fill with junk data
        login.getPage()
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
        login.loginAndVerify(login.botUser, login.botPassword)
    })

    afterAll(() => {
        sidebar.logout()
    })

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly
    */
    it('should see Edji in the title', () => {
        let subject = browser.getTitle()
        let result  = 'Edji'
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".')
    })

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
        dashboard.openNewReading()

        // Enter sample Reading into form
        newReading.titleInput.sendKeys(newReading.titleString)
        // Make private to avoid needing grade levels and subjecst
        newReading.privateButton.click()
        newReading.contentInput.sendKeys(newReading.contentShortString)
        // Submit New Reading
        newReading.clickShareAndArchive()
        browser.wait(EC.invisibilityOf(newReading.confirmArchiveModal), 5000, 'confirm archive modal should not be showing')
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 8000, "finalize reading button never became clickable")
        // Group Label has content prefilled, so we clear it
        newReading.groupInput.clear()
        newReading.groupInput.sendKeys(newReading.groupString)
        // Save first group
        newReading.finalizeButton.click()
        // Should redirect to Project page for new reading
        browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading")
        // Reset user to dashboard
        sidebar.backToDash()
    })


    // /* Test: Add reading, don’t enter title and see error
    //     - Open New Reading page
    //     - Fill all fields *but* title
    //     - Tab and hit enter/ click on “Add reading button”
    //     - Receive error message asking to give reading a title
    // */
    it('should display an error if the title is not filled', () => {
        // Open and wait for New Reading page
        dashboard.openNewReading()
        // Enter sample Reading into form, excluding title
        newReading.titleInput.clear()
        // Make private to avoid needing grade levels and subjects
        newReading.privateButton.click()
        newReading.contentInput.sendKeys(newReading.contentShortString)
        // Submit New Reading
        newReading.addNewReading()
        // Should see error for empty title
        browser.wait(EC.presenceOf(newReading.titleError), 5000, "never saw an error for empty title")
        // Reset user to dashboard
        sidebar.backToDash()
    })

    //  /* Test: Add reading, don’t enter content and see error
    //     - Open New Reading page
    //     - Fill all fields *but* content
    //     - Tab and hit enter/ click on “Add reading button”
    //     - Receive error message asking to give reading content
    // */
    it('should display an error if no content is entered', () => {
        // Open and wait for New Reading page
        dashboard.openNewReading()
        // Enter sample Reading data into form, but clear content
        newReading.titleInput.sendKeys(newReading.titleString)
        newReading.contentInput.clear()
        // Submit New Reading
        newReading.addNewReading()
        // Should see error for empty content
        browser.wait(EC.presenceOf(newReading.contentError), 5000, "never saw an error for empty content")
        // Reset user to dashboard
        sidebar.backToDash()
    })

    /* Test: Add reading, but clear Group Label and see error
        - Open New Reading page
        - Fill all fields *but* group label
        - Tab and hit enter/ click on “Add reading button”
        - Receive error message asking to give reading a group label
    */
    it('should display an error if no group label is entered', () => {
        // Open and wait for New Reading page
        dashboard.openNewReading()
        // Enter sample Reading into form, but clear group label
        newReading.titleInput.sendKeys(newReading.titleString)
        // Make private to avoid needing grade levels and subjecst
        newReading.privateButton.click()
        newReading.contentInput.sendKeys(newReading.contentShortString)
        newReading.clickShareAndArchive()
        browser.wait(EC.elementToBeClickable(newReading.groupInput), 5000, "group input became clickable")
        // This field needs special attention to trigger the required
        newReading.groupInput.clear().then(() => {
            newReading.groupInput.sendKeys(' ')
            newReading.groupInput.sendKeys(protractor.Key.BACK_SPACE) 
        })
        // Submit New Reading to trigger error
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "save reading button never became clickable after content add")
        newReading.finalizeButton.click()
        // Should see error for empty group label
        browser.wait(EC.presenceOf(newReading.groupError), 5000, "never saw an error for empty group label")
        // Close New Group modal
        newReading.newGroupModalClose.click()
        // Reset user to dashboard
        sidebar.backToDash()
    })

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
            dashboard.openNewReading()
            browser.wait(EC.elementToBeClickable(newReading.uploadPDfModalButton), 5000)
            newReading.uploadPDfModalButton.click()
            // Select File to upload
            let fileToUpload = 'assets/2-pages.pdf'
            let absolutePath = path.resolve(__dirname, fileToUpload)
            newReading.pdfFileInput.sendKeys(absolutePath)
            // Begin upload 
            browser.wait(EC.elementToBeClickable(newReading.pdfUploadTrigger), 10000, "button to upload a PDF never became clickable")
            newReading.pdfUploadTrigger.click()
            // Image was uploaded! Insert it
            browser.wait(EC.elementToBeClickable(newReading.insertUploadedPdf), 20000, "the pdf never became available to insert")
            newReading.insertUploadedPdf.click()
            // Should see image in new reading
            browser.wait(EC.presenceOf(newReading.imageInReading), 10000, "never saw PDF in the new reading")
            // Stay on New Reading page for deleting the PDF
        })

        // This following test relies on the previous one for a PDF to delete.
        it('should delete a PDF that was uploaded', function() {
           // Open and wait for New Reading page
            // dashboard.openNewReading()
            browser.wait(EC.elementToBeClickable(newReading.uploadPDfModalButton), 5000, "insert PDF button was not clickable")
            newReading.uploadPDfModalButton.click()
            browser.wait(EC.elementToBeClickable( element(by.id("titleCard"))), 5000, "insert PDF modal did not become available")
            // Click the delete button
            let allPdfCards = element.all(by.id("titleCard"))
            let pdfCard = element(by.id("titleCard"))

            let delBtn = element(by.id("pdfDelBtn"))
            let confirmDelBtn = element(by.id("pdfDelBtnConfirm"))

            browser.wait(EC.elementToBeClickable(delBtn), 5000, "delBtn never became clickable")
            delBtn.click()

            browser.wait(EC.elementToBeClickable(confirmDelBtn), 5000, "confirm delete button never became clickable")
            confirmDelBtn.click()

            // TO-DO: We've had issues tracking this via count
            // browser.wait(EC.invisibilityOf(delBtn), 5000, 'delete button should not be visible.')

            // Reset user to dashboard
            sidebar.backToDash()
        })
    })

    describe("Image upload", () => {
        /**
         * Test: Add reading with an image
         */
        it('should upload an image to a reading and save it to the reading', function() {
            // Open and wait for New Reading page
            dashboard.openNewReading()
            newReading.insertImageButtonTap()
            browser.wait(EC.elementToBeClickable(newReading.imageUploadTrigger), 6000, "image upload trigger never became clickable")
            
            // Select File to upload
            let fileToUpload = 'assets/titration.jpg'
            let absolutePath = path.resolve(__dirname, fileToUpload)
            newReading.imageFileInput.sendKeys(absolutePath)

            // Begin upload 
            browser.wait(EC.elementToBeClickable(newReading.imageUploadTrigger), 5000, "button to upload an image never became clickable")
            newReading.imageUploadTrigger.click()

            // Image was uploaded! Insert it
            browser.wait(EC.elementToBeClickable(newReading.uploadedImage), 15000, "never saw the image uploaded")
            newReading.uploadedImage.click()

            // Complete rest of reading
            newReading.titleInput.sendKeys(newReading.titleImageString)
            // Make private to avoid needing grade levels and subjecst
            newReading.privateButton.click()

            // Submit New Reading
            newReading.clickShareAndArchive()
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable")
            newReading.finalizeButton.click()

            // Should create a new Reading
            browser.wait(EC.urlContains("project"), 10000, "never arrived at new reading")

            // Should see image in new reading
            browser.wait(EC.presenceOf(newReading.imageInReading), 10000, "never saw an image in the new reading")

            // Reset user to dashboard
            sidebar.backToDash()
        })
    })

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
            // Reset user to dashboard
            // sidebar.backToDash()
            // Open and wait for New Reading page
            dashboard.openNewReading()
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
            // Enter sample Reading into form
            newReading.titleInput.sendKeys(newReading.titleString)
            // Make private to avoid needing grade levels and subjecst
            newReading.privateButton.click()
            // Content fill
            newReading.contentInput.sendKeys(newReading.contentShortString)
            newReading.contentInput.sendKeys(protractor.Key.RETURN)
            // Saving Source is tested in the step
            newReading.sourceInput.sendKeys(newReading.sourceString)
            // Submit New Draft for Reading
            newReading.saveDraftNewReading()
            // Should redirect to new reading page with a reading id and a success alert
            browser.wait(EC.visibilityOf(newReading.successAlert), 15000, "never saw the success alert")
            // Add more text
            newReading.contentInput.sendKeys(newReading.contentShortStringB)
            // Submit New Reading
            newReading.clickShareAndArchive()
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable")
            newReading.finalizeButton.click()
            // Should create a new Reading
            browser.wait(EC.urlContains("project"), 10000, "never arrived at new reading")
            // Reset user to dashboard
            sidebar.backToDash()
        })
    })

    /* Test: Add reading, then adjust with editing buttons. (Headers, bold, underlines, italixs, text size)
        - Log in with Teacher account
        - Arrive at Dashboard
        - Add reading content.
        - Adjust editing buttons.
        - Click Add Reading
    */

}) // describe 'Account Page'