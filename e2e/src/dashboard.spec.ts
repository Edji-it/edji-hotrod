//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor';
import { Dashboard, Login, NewReading, Sidebar } from './page-objects';

/*
    27 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the dashboard page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Dashboard Page', () => {

    /* ---- Variable Initialization --------------- */
    let login       = new Login();
    let dashboard   = new Dashboard();
    let sidebar     = new Sidebar();
    let newReading  = new NewReading();
    let EC = protractor.ExpectedConditions; // vital


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

    afterAll(() => {
        sidebar.logout();
    })

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('should arrive at dashboard', () => {
        browser.wait(EC.urlContains("dashboard"), 15000, "never arrived at dashboard");
    });

    /**
     * Paginate Created Readings
     * - Requires "testbot" to have more than one page of Created Readings
     */
    it("should paginate Created readings", () => {
        // Wait for Readings to load into Dashboard
        browser.wait(EC.elementToBeClickable(dashboard.firstReadingTitle), 3000, "never found Created Readings on Dashboard")
        // Save title of first Reading on first page
        let firstReadingTitleStr = '';
        dashboard.firstReadingTitle.getText().then((text) => { 
            firstReadingTitleStr = text + "";
            expect(text.length).toBeGreaterThan(1);
        });
        
        // Scroll to Joined pagination bar
        browser.executeScript('window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);').then(() => {
            browser.wait(EC.elementToBeClickable(dashboard.createdListNextPage), 3000, "next page arrow for Created Readings did not become clickable");
        });
        // Go to next page
        dashboard.createdListNextPage.click();
        // Wait for second page load
        browser.wait(EC.visibilityOf(dashboard.secondPageFirstReadingTitle), 3000, "did not load next page of Created Readings");
        // Verify First Reading Title has changed
        expect(dashboard.secondPageFirstReadingTitle.getText().then((text) => {console.log(text, firstReadingTitleStr); return text == firstReadingTitleStr})).toBeFalsy();
        // Scroll back to pagination
        browser.executeScript('window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);').then(() => {
            browser.wait(EC.elementToBeClickable(dashboard.createdListPrevPage), 3000, "prev page arrow for Created Readings did not become clickable");
        });
        // Go to previous page
        dashboard.createdListPrevPage.click();
        // Wait for first page load
        browser.wait(EC.invisibilityOf(dashboard.secondPageFirstReadingTitle), 3000, "did not leave second page when trying to return to first page");
    })

    // this test relies on the user having at least one project - could do more verification of the project card itself
    it("should see a list of projects", () => {
        // Switch to the created readings tab on mobile (will simply skip if on desktop)
        dashboard.goToCreatedTab()
        
        browser.wait(EC.presenceOf(dashboard.firstProject), 8000, "never saw a project");
        expect(dashboard.projectCards.count()).toBeGreaterThan(0);
    });

    // describe("Navigation from project dashboard", () => {
        it("should get to a project by clicking a card", () => {
            // Switch to the created readings tab on mobile (will simply skip if on desktop)
            dashboard.goToCreatedTab()
            
            browser.wait(EC.presenceOf(dashboard.firstProject), 8000, "never saw a project");
            dashboard.firstProject.click();
            browser.wait(EC.urlContains("project"), 5000, "clicking on project card did not bring me to a project");

            sidebar.backToDash();
        });

        it("should get to a project by entering a code", () => {
            // Use the function to check this as it can handle multiple display types (mobile/desktop/etc)
            dashboard.enterProjectCodeFromNav(login.validProjectCode);

            // verification
            browser.wait(EC.urlContains("project"), 5000, "entering a project code did not bring me to a project");

            // Return to dashboard
            sidebar.backToDash();
        });
    // });

    // /* ---- Dashboard Tests ------------------------ */

    // /* Test: Can delete a project
    // 6.1.17
    // */
    describe("Delete Readings & Projects", () => {
        it ("Delete a project off of a new reading.", () => {
            // Switch to the created readings tab on mobile (will simply skip if on desktop)
            dashboard.goToCreatedTab()
            
            // Click the dropdown menu
            browser.wait(EC.elementToBeClickable(dashboard.firstDropdownMenu), 5000, "never saw a reading card dropdown menu");
            dashboard.firstDropdownMenu.click();
            // // Click the create new group button & create a new project
            browser.wait(EC.elementToBeClickable(dashboard.newGroupButton), 5000, "create new group button was never clickable from dropdown menu");
            dashboard.newGroupButton.click();
            
            // Create a new group
            dashboard.createNewGroupModalInput(dashboard.uniqueGroupTitle);

            // We're gonna identify the new project by it's new group class since it was just created. 
            let newProjectCard = element(by.css('.new-project'));
            browser.wait(EC.presenceOf(newProjectCard), 5000, "never saw a newProjectCard");

            // Now click that delete button
            let newProjectCardDelBtn = newProjectCard.element(by.css(".btn--delete-project"));
            browser.wait(EC.elementToBeClickable(newProjectCardDelBtn), 5000, "never saw a project delete button");
            newProjectCardDelBtn.click();

            // Click ok on that there delete modal
            let delProjectModal = element(by.id('deleteProjectModal'));
            browser.wait(EC.presenceOf(delProjectModal), 5000, "never saw a delProjectModal");
            let delProjectBtnModal = element(by.id("delProjectBtnModal"));
            browser.wait(EC.presenceOf(delProjectBtnModal), 5000, "never saw a delProjectBtn on the delProjectModal");
            browser.wait(EC.elementToBeClickable(delProjectBtnModal), 5000, "delProjectBtn on the delProjectModal was never clickable");
            delProjectBtnModal.click();
            // expect((newProjectCard.isPresent())).toEqual(false);
            browser.sleep(3000);
            browser.wait(EC.invisibilityOf(newProjectCard), 5000, "saw a newProjectCard (END). We aren't supposed to.");
        }); // it ("Delete a project off of a new reading.", () => {

        it("Make a new reading then delete it.", () => {

            // Approach 2
            let uniqueTitle: string = new Date().valueOf().toString();

            // Create a new reading to control it properly thru the process
            dashboard.openNewReading();

            // Enter sample Reading into form
            newReading.titleInput.sendKeys(uniqueTitle);
            // Select Grade Range
            newReading.gradeTileK.click();
            newReading.gradeTileU.click();
            // Select Subject
            newReading.subjectDropdown.click();
            newReading.subjectFirstOption.click();
            newReading.contentInput.sendKeys(newReading.contentShortString);
            newReading.sourceInput.sendKeys(newReading.sourceString);

            // Submit New Reading
            newReading.addNewReading()
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();

            // Should redirect to Project page for new reading
            browser.wait(EC.urlContains("project"), 7500, "never arrived at the reading page after published");

            // Go to the dashboard
            sidebar.backToDash();

            // Switch to the created readings tab on mobile (will simply skip if on desktop)
            dashboard.goToCreatedTab()

            browser.wait(EC.elementToBeClickable(element(by.css('button[testFindOptions="' + uniqueTitle + '"]'))), 8000, "reading card options button never became clickable after load");
            element(by.css('button[testFindOptions="' + uniqueTitle + '"]')).click();

            browser.wait(EC.elementToBeClickable(element(by.css('button[testDelete="' + uniqueTitle + '"]'))), 5000, "copy and edit button never became clicakble after options dropdown click");
            element(by.css('button[testDelete="' + uniqueTitle + '"]')).click();

            let deleteModal = element(by.id('deleteReadingModal'));
            browser.wait(EC.presenceOf(deleteModal), 5000, "never saw a deleteModal");
            browser.wait(EC.presenceOf(dashboard.deleteConfirm), 5000, "never saw a deleteConfirm on the deleteModal");
            browser.wait(EC.elementToBeClickable(dashboard.deleteConfirm), 5000, "deleteConfirm on the deleteModal was never clickable");
            // Delete modal confirm click has promise issues, so treat it a bit differently
            dashboard.deleteConfirm.click()
            // Unable to confirm title
            browser.wait(EC.invisibilityOf(element(by.cssContainingText('.reading-title-text', uniqueTitle))), 8000, "saw the unique readingTitle (END). We aren't supposed to.");
        }); // it ("Make a new reading then delete it")
    });
}); // describe 'Dashboard Page'