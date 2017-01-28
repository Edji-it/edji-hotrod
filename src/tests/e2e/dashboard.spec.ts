import { browser, by, element, protractor } from 'protractor';
import Dashboard = require('./page-objects/dashboard-page');
import Login    = require('./page-objects/login-page');
import Home     = require('./page-objects/home-page');
import Sidebar  = require('./page-objects/sidebar-page');

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
    
    let dashboard   = new Dashboard();
    let login       = new Login();
    let home        = new Home();
    let sidebar     = new Sidebar();
    let EC          = protractor.ExpectedConditions; // vital

    /* ---- beforeEach ---------------------------- */
    // Does this before each test.
    beforeEach(() => {
        
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test FAILED', () => {
        let subject = browser.getTitle();
        let result  = 'Edji';
        browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".');
    });

    /* ---- Dashboard Tests ------------------------ */

     /* Test: Student account can log out successfully
        - Log in with Student account
        - Arrive at Dashboard
        - Log out and arrive at home page
    */
    it('should log out of Student account successfully', () => {
        // Login page
        login.getPage();
        login.enterStudentAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("home"), 5000, ('Never arrived at the url containing: home.'));
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