import { browser, by, element, protractor } from 'protractor';
import Login    = require('./page-objects/login-page');
import Home     = require('./page-objects/home-page');

/*
    23 Jan 2017
    Last Modified: 23 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {

    /* ---- Variable Initialization --------------- */
    let login   = new Login();
    let home    = new Home();
    let EC      = protractor.ExpectedConditions; // vital

/* ---- beforeEach ---------------------------- */
    beforeEach (() => {
        login.getPage();
    });

/* ---- Vital Super Basic Test  --------------- */
    
    /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
    it('Extremely Basic Test FAILED', () => {
        let subject = browser.getTitle();
        browser.wait(EC.titleContains('Edji'), 5000, 'Title should contain "Edji".');
    });

/* ---- Generic Login Tests ---------------------------- */
    
    /* Test: Log in to Student account.
        - Go to the Home Page.
        - Log in, dammit.
    */
    it('should be able to log into Student account.', () => {
        login.enterStudentAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("dashboard"), 5000, ('Never arrived at the url containing: dashboard.'));
    });

    /* Test: Log in to Teacher account.
        - Go to the Home Page.
        - Log in, dammit.
    */
    it('should be able to log into Teacher account.', () => {
        login.enterTeacherAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("dashboard"), 5000, ('Never arrived at the url containing: dashboard.'));
    });
    
    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they dont enter a password', () => {
        login.enterUsername(login.studentUser);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they dont enter a username', () => {
        login.enterPassword(login.studentPassword);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: enter a correct user, but an invalid password
    it('user should receive error message when they dont enter an incorrect password', () => {
        login.enterUsername(login.studentUser);
        login.enterPassword(login.invalidEntry);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
        browser.wait(EC.urlContains("login"), 5000, ('Was not at the url containing: login.'));
    }); 

    // Test: enter an invalid user, but a correct password
    it('user should receive error message when they dont enter an incorrect password', () => {
        login.enterUsername(login.invalidEntry);
        login.enterPassword(login.studentPassword);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
        browser.wait(EC.urlContains("login"), 5000, ('Was not at the url containing: login.'));
    }); 

/* ---- Project Code Login Tests ---------------------------- */

    /* Test: Get to project through quick code, enter as guest
        - Path to Edji.it 
        - Enter in valid project code, click join project or hit enter
        - Redirect to “Join” page
        - Click on join as guest field and type in valid not vulgar name hit enter or click join project button
        - Redirect to project
    */
    it('user should be able to get to a project through quick code, enter as guest', () => {

        // Home Page
        home.getPage();
        home.enterProjectCode(login.validProjectCode);
        home.clickJoinProjectButton();

        // Join/Login Page
        browser.wait(EC.urlContains("join"), 5000, ('Never arrived at the url containing: "join".'));
        login.enterGuestName(login.testGuestName);
        login.clickGuestLoginButton();

        //Project Page
        browser.wait(EC.urlContains("project"), 5000, ('Never arrived at the url containing: "project".'));
        expect(element(by.id("projectTitle")).isPresent()).toBe(true, 'Could not find the project title.');  //FIND THE TITLE
    });

    /* Test: Get to project through quick code, be rejected because of vulgar name
        - Path to Edji.it
        - Enter in valid project code, click join project or hit enter
        - Redirect to “Join” page
        - Click on join as guest field and type in vulgar name hit enter or click join project button
        - Receive “Name is invalid” error message
    */
    /*
    it('should be able to get to project through quick code, be rejected because of vulgar name', () => {
        // Home Page
        submitProjectCode('m7y5');

        // Join / Login Page
        verifyURL("join");
        submitGuestName("Fucking Fucks");

        // Lets find that error
        let errorMsg = element(by.id('msgBadName'));
        browser.wait(EC.visibilityOf(errorMsg), 3000, 'The error message should show up. It did not.');
    });
    */

}); // describe Login Page