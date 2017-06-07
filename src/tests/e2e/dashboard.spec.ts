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

    // this test relies on the user having at least one project - could do more verification of the project card itself
    it("should see a list of projects", () => {
        browser.wait(EC.presenceOf(dashboard.firstProject), 8000, "never saw a project");
        expect(dashboard.projectCards.count()).toBeGreaterThan(0);
    });

    describe("Navigation from project dashboard", () => {
        it("should get to a project by clicking a card", () => {
            browser.wait(EC.presenceOf(dashboard.firstProject), 8000, "never saw a project");
            dashboard.firstProject.click();
            browser.wait(EC.urlContains("project"), 5000, "clicking on project card did not bring me to a project");
        });

        it("should get to a project by entering a code", () => {
            dashboard.getPage();
            // initial validation
            browser.wait(EC.presenceOf(dashboard.projectCodeInput), 8000, "never saw a project");

            // form handling
            dashboard.projectCodeInput.sendKeys(login.validProjectCode);
            browser.wait(EC.elementToBeClickable(dashboard.projectJoinButton), 5000, "project code input was never clickable");
            dashboard.projectJoinButton.submit();

            // verification
            browser.wait(EC.urlContains("project"), 5000, "entering a project code did not bring me to a project");
        });
    });

    /* ---- Dashboard Tests ------------------------ */

    /* Test: Can delete a project
    6.1.17
    */
    describe("Delete Readings & Projects", () => {
        it("Make a new reading then delete it.", () => {

            // Approach 2
            let uniqueTitle: string = new Date().valueOf().toString();

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

            // Should redirect to Project page for new reading
            browser.wait(EC.urlContains("project"), 7500, "never arrived at the reading page after published");

            // Go to the dashboard
            dashboard.getPage();

            let readingTitle = element(by.cssContainingText('.reading-title-text', uniqueTitle));
            browser.wait(EC.presenceOf(readingTitle), 5000, "never saw a unique readingTitle");

            let allReadings = element.all(by.css(".reading-card"));
            browser.wait(EC.presenceOf(allReadings.first()), 5000, "never saw a readingCard");
            let targetDropdown = allReadings.filter(function(elem, index) {
                return elem.element(by.cssContainingText('.reading-title-text', uniqueTitle)) ===  readingTitle;
            }).toElementFinder_().element(by.id('optionsWrap'));
            targetDropdown.click();

            let targetDelButton = targetDropdown.element(by.cssContainingText('.dropdown-item', 'Delete'));
            browser.wait(EC.presenceOf(targetDelButton), 5000, "never saw a targetDelButton");
            targetDelButton.click();
            browser.sleep(3000);

            browser.wait(EC.invisibilityOf(readingTitle), 5000, "saw the unique readingTitle (END). We aren't supposed to.");

        }); // it ("Make a new reading then delete it")

        it ("Delete a project off of a new reading.", () => {

            let uniqueGroupTitle = "Cynder is such a cool dog";

            dashboard.getPage();

            newReading.enterSampleReading();

            dashboard.getPage();

            // Click the dropdown menu
            browser.wait(EC.presenceOf(dashboard.dropDownMenu), 5000, "never saw a dropdownMenu");
            browser.wait(EC.elementToBeClickable(dashboard.dropDownMenu), 5000, "create new group button was never clickable");
            dashboard.dropDownMenu.click();

            // Click the create new group button & create a new project
            dashboard.createNewGroupButton.click();
            dashboard.createNewGroupModalInput(uniqueGroupTitle);

            // We're gonna identify the new project by it's new group class since it was just created. 
            let newProjectCard = element(by.css('.new-project'));
            browser.wait(EC.presenceOf(newProjectCard), 5000, "never saw a newProjectCard");

            // Now click that delete button, baby
            let newProjectCardDelBtn = newProjectCard.element(by.css(".btn--delete-project"));
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

            // False Positive
            // browser.wait(EC.visibilityOf(newProjectCard), 5000, "saw a newProjectCard (END). We aren't supposed to.");
        }); // it ("Delete a project off of a new reading.", () => {
    });

    /* Test: Teacher account can log out successfully
        - Log in with Teacher account
        - Arrive at Dashboard
        - Log out and arrive at home page
    */

    /* Test: Type in invalid project code at quick code enter
        - Path to Edji.it
        - Click on quick code and enter in invalid code, click enter or join button
        - Receive error stating that code is invalid
    */

    /* Test: Get to new project through dashboard
        - Be on Student dashboard page
        - Click project code and enter valid project code, click join button or hit enter
        - Redirect to project
    */

    /* Test: Go to previous project
        - Go to student dashboard
        - Click on a project under “your projects”
        - Redirect to correct project
    */

}); // describe 'Dashboard Page'