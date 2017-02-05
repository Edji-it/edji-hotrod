import { browser, by, element, protractor } from 'protractor';
import { Dashboard, Login } from './page-objects';

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
    let login = new Login();
    let dashboard   = new Dashboard();
    let EC          = protractor.ExpectedConditions; // vital

    beforeAll(() => {
        // make sure the user is logged in before the suite runs
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterTeacherAccountCredentials();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.loginButton.click();
    })

    afterEach(() => {
        // navigate back to the dashboard after every test
        dashboard.getPage();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('should arrive at dashboard', () => {
        browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");
    });

    // this test relies on the user having at least one project - could do more verification of the project card itself
    it("should see a list of projects", () => {
        browser.wait(EC.presenceOf(dashboard.firstProject), 5000, "never saw a project");
        expect(dashboard.projectCards.count()).toBeGreaterThan(0);
    });

    describe("Navigation from project dashboard", () => {
        it("should get to a project by clicking a card", () => {
            browser.wait(EC.presenceOf(dashboard.firstProject), 5000, "never saw a project");
            dashboard.firstProject.click();
            browser.wait(EC.urlContains("project"), 5000, "clicking on project card did not bring me to a project");
        });

        it("should get to a project by entering a code", () => {
            // initial validation
            browser.wait(EC.presenceOf(dashboard.projectCodeInput), 5000, "never saw a project");

            // form handling
            dashboard.projectCodeInput.sendKeys(login.validProjectCode);
            browser.wait(EC.elementToBeClickable(dashboard.projectJoinButton), 5000, "project code input was never clickable");
            dashboard.projectJoinButton.submit();

            // verification
            browser.wait(EC.urlContains("project"), 5000, "entering a project code did not bring me to a project");
        });
    });

    /* ---- Dashboard Tests ------------------------ */

     /* Test: Student account can log out successfully
        - Log in with Student account
        - Arrive at Dashboard
        - Log out and arrive at home page
    */

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