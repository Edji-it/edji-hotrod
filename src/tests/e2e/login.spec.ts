import { browser, by, element, protractor } from 'protractor';
import Login    = require('./page-objects/login-page');
import Home     = require('./page-objects/home-page');
import Sidebar     = require('./page-objects/sidebar-page');

/*
    23 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the home page!
*/

// Now into the testing.
describe('Login Page', () => {

    /* ---- Variable Initialization --------------- */
    let login   = new Login();
    let home    = new Home();
    let sidebar    = new Sidebar();
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
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.enterStudentAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("dashboard"), 5000, ('Never arrived at the url containing: dashboard.'));
        sidebar.logOutButton.click();
    });

    /* Test: Log in to Teacher account.
        - Go to the Home Page.
        - Log in, dammit.
    */
    it('should be able to log into Teacher account.', () => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterTeacherAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("dashboard"), 5000, ('Never arrived at the url containing: dashboard.'));
        sidebar.logOutButton.click();
    });
    
    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they dont enter a password', () => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterUsername(login.studentUser);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgNoPassword), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they dont enter a username', () => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterPassword(login.studentPassword);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: enter a correct user, but an invalid password
    it('user should receive error message when they enter an incorrect password', () => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterUsername(login.studentUser);
        login.enterPassword(login.invalidEntry);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgErrorPassword), 5000, 'The error message never showed up. Like my last date.');
        browser.wait(EC.urlContains("login"), 5000, ('Was not at the url containing: login.'));
    }); 

    // Test: enter an invalid user, but a correct password
    it('user should receive error message when they enter an incorrect username', () => {
        login.getPage();
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
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

}); // describe Login Page