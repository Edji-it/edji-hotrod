//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor';
import { Dashboard, Login, NewReading, Sidebar, Home } from './page-objects';
import { LoginForm } from './components';

/* ---- Versioning Tests ------------------------ */
describe("Versioning - ", () => {

    /* ---- Variable Initialization --------------- */
    let login = new Login();
    let dashboard = new Dashboard();
    let loginForm = new LoginForm();
    let sidebar = new Sidebar();
    let newReading  = new NewReading();
    let home  = new Home();
    let EC = protractor.ExpectedConditions; // vital
    var uniqueTitle: string = new Date().valueOf().toString();
    let titleUpdate = uniqueTitle + 'update';

    beforeAll(() => {
        // Login as test account that we can fill with junk data
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterUsername(login.botUser);
        login.enterPassword(login.botPassword);
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.loginButton.click();
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");
    })

    afterEach(() => {
        // navigate back to the dashboard after every test
        dashboard.getPage();
    });

    afterAll(() => {
        sidebar.logout();
    })


    it('should see Edji in the title', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    /* Test: Add a reading
        - Click the 'Copy and Edit' button
        - Be redirected to the "new reading page"
        - Page should be populated with 'old' reading (formating, pictures and pdf's should be the same)
        - User should be able to save as draft.
        - Newly created version should have version number = old version number + 1
            - Users should be able to return to new version and publish
        - Create a new group for an old version
    */
    // 
    it('should create a new reading with a specific title', () => {
        // Create a new reading to control it properly thru the process
        // Open and wait for New Reading page
        newReading.getPage();
        browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

        // Enter sample Reading into form
        newReading.titleInput.sendKeys(uniqueTitle);
        newReading.contentInput.sendKeys(newReading.contentShortString);
        newReading.sourceInput.sendKeys(newReading.sourceString);

        // Group Label has content prefilled, so we clear it
        // newReading.groupInput.clear();
        // newReading.groupInput.sendKeys(newReading.groupString);

        // Submit New Reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "publish reading button never became clickable after new reading form entry");
        //newReading.addButton.submit();
        newReading.addButton.click();
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
        newReading.finalizeButton.click();

        // // Click the 'Go to Reading' button on share button modal
        // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
        // newReading.goToReadingButton.click();

        // Should redirect to Project page for new reading
        browser.wait(EC.urlContains("project"), 7500, "never arrived at the reading page after published");

        // Go to the dashboard
        dashboard.getPage();
    });

    it('should go to new reading page with existing reading and validate the reading; then save it as a draft', () => {
        // Make a new version of that reading
        // Click the options, then copy and edit button
        browser.wait(EC.elementToBeClickable(element(by.css('button[testFindOptions="' + uniqueTitle + '"]'))), 8000, "reading card options button never became clickable after load");
        element(by.css('button[testFindOptions="' + uniqueTitle + '"]')).click();

        browser.wait(EC.elementToBeClickable(element(by.css('button[testFindCopyAndEdit="' + uniqueTitle + '"]'))), 5000, "copy and edit button never became clicakble after options dropdown click");
        element(by.css('button[testFindCopyAndEdit="' + uniqueTitle + '"]')).click();

        // Make sure it arrives at the new reading page with the copyId query param
        browser.wait(EC.urlContains("new-reading"), 5000, "never arrived at the new reading page");
        browser.wait(EC.urlContains("copyId"), 5000, "never passed an ID of the previous reading");

        // Make sure the copyId is valid
        browser.wait(function() {
            return browser.getCurrentUrl().then(function(url) {
                return newReading.findIdExp.test(url);
            });
        }, 5000, "reading ID not valid");

        // Check the data in the reading
        //
        // *** we need to resolve this later. the medium content editor dev wizard needs to figure this out
        //
        //expect(newReading.contentInput.getInnerHtml).toEqual(newReading.contentShortString);

        // Add more text
        newReading.contentInput.sendKeys(newReading.contentShortStringB);

        // Update the title
        //newReading.titleInput.clear();
        newReading.titleInput.sendKeys('update');

        // Save it as a draft
        browser.wait(EC.elementToBeClickable(newReading.draftButton), 5000, "add draft button never became clickable after form entry");
        newReading.draftButton.click();

        // Draft should be created in this block
        // Should redirect to new reading page with same inputs and a success alert
        browser.wait(EC.urlContains("new-reading"), 5000, "never created the draft");
        browser.wait(EC.presenceOf(newReading.successAlert), 5000, "never saw the success alert");
    });

    // it('should make sure latest version is 2, past versions show, and find a version 1', () => {
    //     // Make sure the version number is greater than beforeAll
    //     // Make sure the reading cards load before moving on to the next step
    //     browser.wait(EC.elementToBeClickable(dashboard.firstProject), 15000, "reading cards never loaded");

    //     // Verify the version number is '2' for the updated version
    //     expect(element(by.css('p[testVersionNumber*="' + uniqueTitle + '"]')).getText()).toBe('Version 2');

    //     // Expand the past versions
    //     element(by.css('[testFindVersionToggle="' + titleUpdate + '"]')).click();

    //     // Verify version 1 of this reading is in the list
    //     browser.wait(EC.elementToBeClickable(element(by.css('p[testVersionNumberV="' + uniqueTitle + '"]'))), 5000, "past versions never loaded");
    //     expect(element(by.css('p[testVersionNumberV="' + uniqueTitle + '"]')).getText()).toBe('Version 1');
    // });

    it('should open up the latest version that is a draft and publish the draft', () => {  
        // Go back in to that drafted reading
        browser.wait(EC.elementToBeClickable(element(by.cssContainingText('.draft-edit', titleUpdate))), 8000, "draft never became clickable after loading of reading cards");
        element(by.cssContainingText('.draft-edit', titleUpdate)).click();

        // Make sure the site arrives at the new reading page with the copyId query param
        browser.wait(EC.urlContains("new-reading"), 5000, "never arrived at the new reading page");

        // Publish the reading
        browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "publish reading button never became clickable after loading draft");
        //newReading.addButton.submit();
        newReading.addButton.click();
        browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
        newReading.finalizeButton.click();

        // // Click the 'Go to Reading' button on share button modal
        // browser.wait(EC.elementToBeClickable(newReading.goToReadingButton), 5000, "share code modal go to reading button never became clickable")
        // newReading.goToReadingButton.click();

        // Reading should be published
        browser.wait(EC.urlContains("project"), 15000, "never arrived at the finished reading");
    });

    it('should create a new group for an older version', () => {
        // Create a new group for an older version
        // Make sure the reading cards load before moving on to the next step
        browser.wait(EC.elementToBeClickable(dashboard.firstProject), 15000, "reading cards never loaded");

        // Expand the past versions
        element(by.css('[testFindVersionToggle="' + titleUpdate + '"]')).click();

        // Verify version 1 of this reading is in the list
        browser.wait(EC.elementToBeClickable(element(by.css('p[testVersionNumberV="' + uniqueTitle + '"]'))), 5000, "past versions never loaded");
        browser.wait(EC.elementToBeClickable(element(by.css('button[testFindOptionsV="' + uniqueTitle + '"]'))), 8000, "reading card options for versionbutton never became clickable after load");
        element(by.css('button[testFindOptionsV="' + uniqueTitle + '"]')).click();

        // Make sure the Create New Group button shows up and then click on it
        browser.wait(EC.elementToBeClickable(element(by.css('button[testFindCreateNewGroupV="' + uniqueTitle + '"]'))), 5000, "create new group button never became clicakble after options dropdown click");
        element(by.css('button[testFindCreateNewGroupV="' + uniqueTitle + '"]')).click();

        // Wait for the input field for the group label to show and enter text
        browser.wait(EC.elementToBeClickable(dashboard.projectLabel), 5000);
        dashboard.projectLabel.sendKeys(uniqueTitle);

        // Create the group
        dashboard.groupCreate.click();

        // Locate the group and confirm the name
        browser.wait(EC.elementToBeClickable(element(by.css('span[testFindGroupV="' + uniqueTitle + '"]'))), 5000, "new group label never showed up");
    });
});