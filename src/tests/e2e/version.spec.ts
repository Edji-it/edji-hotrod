//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor';
import { Dashboard, Login, NewReading, Sidebar, Home } from './page-objects';
import { LoginForm } from './components';

/* ---- Versioning Tests ------------------------ */
describe("Create Reading Tests", () => {

    /* ---- Variable Initialization --------------- */
    let login = new Login();
    let dashboard = new Dashboard();
    let loginForm = new LoginForm();
    let sidebar = new Sidebar();
    let newReading  = new NewReading();
    let home  = new Home();
    let EC = protractor.ExpectedConditions; // vital
    var uniqueTitle: string = '';

    beforeAll(() => {
        // make sure the user is logged in before the suite runs
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        // log in a user
        loginForm.login();
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
    describe("Versioning", () => {
        it('should create a new reading', () => {
            dashboard.getPage();
            // Create a new reading to control it properly thru the process
            // Open and wait for New Reading page
            newReading.getPage();
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);

            // Generate a unique title so protractor can find it later
            uniqueTitle = new Date().valueOf().toString();

            // Enter sample Reading into form
            newReading.titleInput.sendKeys(uniqueTitle);
            newReading.contentInput.sendKeys(newReading.contentShortString);
            newReading.sourceInput.sendKeys(newReading.sourceString);

            // Group Label has content prefilled, so we clear it
            newReading.groupInput.clear();
            newReading.groupInput.sendKeys(newReading.groupString);

            // Submit New Reading
            browser.wait(EC.elementToBeClickable(newReading.addButton), 5000, "login button never became clickable after login form entry");
            //newReading.addButton.submit();
            newReading.addButton.click();

            // Should redirect to Project page for new reading
            browser.wait(EC.urlContains("project"), 5000, "never arrived at new reading");

            // Go to the dashboard
            dashboard.getPage();
        });

        it('should go to new reading page with existing reading and validate the reading; then save it as a draft', () => {
            // Make a new version of that reading
            // Click the options, then copy and edit button
            browser.wait(EC.elementToBeClickable(element(by.css('button[testFindOptions="' + uniqueTitle + '"]'))), 5000, "options button never became clickable after load");
            element(by.css('button[testFindOptions="' + uniqueTitle + '"]')).click();

            browser.wait(EC.elementToBeClickable(dashboard.copyAndEditButton), 5000, "copy and edit button never became clicakble after options dropdown click");
            dashboard.copyAndEditButton.click();

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

            // Update the title
            newReading.titleInput.clear();
            newReading.titleInput.clear().then(function() {
                newReading.titleInput.sendKeys('update' + uniqueTitle);
            })

            // Save it as a draft
            newReading.draftButton.click();
        });

        it('should make sure the version number increments by 1', () => {
        // Make sure the version number is greater than beforeAll
        
        });

        it('should open up the latest version that is a draft and publish the draft', () => {  
        // Go back in to that drafted reading


        // Publish the reading

        });

        it('should create a new group for an older version', () => {  
        // Create a new group for an older version

        });
    });
});