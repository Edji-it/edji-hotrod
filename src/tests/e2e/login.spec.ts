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
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterTeacherAccountCredentials();
        login.clickLoginButton();

        browser.wait(EC.urlContains("dashboard"), 5000, ('Never arrived at the url containing: dashboard.'));
        sidebar.logOutButton.click();
    });
    
    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they don\'t enter a password', () => {
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterUsername(login.studentUser);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgError), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: Not typing in a password on log in should throw an error message.
    it('user should receive error message when they don\'t enter a username', () => {
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterPassword(login.studentPassword);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgError), 5000, 'The error message never showed up. Like my last date.');
    }); 

    // Test: enter a correct user, but an invalid password
    it('user should receive error message when they enter an incorrect password', () => {
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterUsername(login.studentUser);
        login.enterPassword(login.invalidEntry);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgError), 5000, 'The error message never showed up. Like my last date.');
        browser.wait(EC.urlContains("login"), 5000, ('Was not at the url containing: login.'));
    }); 

    // Test: enter an invalid user, but a correct password
    it('user should receive error message when they enter an incorrect username', () => {
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
        login.clearLoginFields();
        login.enterUsername(login.invalidEntry);
        login.enterPassword(login.studentPassword);
        login.clickLoginButton();
        
        browser.wait(EC.presenceOf(login.msgError), 5000, 'The error message never showed up. Like my last date.');
        browser.wait(EC.urlContains("login"), 5000, ('Was not at the url containing: login.'));
    }); 

}); // describe Login Page