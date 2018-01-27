//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor';
import { Discover, Login, NewReading, Sidebar } from './page-objects';

/*
    Discover Feed tests
*/

// Now into the testing.
describe('Discover Feed', () => {

    /* ---- Variable Initialization --------------- */
    let login       = new Login();
    let discover   = new Discover();
    let sidebar     = new Sidebar();
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
    });

    afterAll(() => {
        sidebar.logout();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    // Discover Feed should exist and load for every user
    it("should arrive at Discover Feed", () => {
        discover.getPage();
        browser.wait(EC.urlContains("discover"), 5000, "never arrived at Discover Feed");
    });

    // Testbot follows no one by default
    it("should not see readings in following feed if not following anyone", () => {
        browser.wait(EC.presenceOf(discover.followEdjiMsg), 5000, "never saw message to follow Edji");
        browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, "should not see readings in following feed");
    });

    it("should see readings in following feed if following someone", () => {
        browser.wait(EC.elementToBeClickable(discover.followEdjiTag), 5000, "never saw message to follow Edji");
        discover.followEdjiTag.click();
        browser.wait(EC.presenceOf(discover.firstFeedReading), 5000, "followed user reading not showing");
    });

    /**
     * 
     */
    // describe("Navigation from project discover", () => {
    //     it("should get to a project by clicking a card", () => {
    //         browser.wait(EC.presenceOf(discover.firstProject), 8000, "never saw a project");
    //         dashboard.firstProject.click();
    //         browser.wait(EC.urlContains("project"), 5000, "clicking on project card did not bring me to a project");
    //     });

    //     it("should get to a project by entering a code", () => {
    //         dashboard.getPage();
    //         // initial validation
    //         browser.wait(EC.presenceOf(dashboard.projectCodeInput), 8000, "never saw lightning code input");

    //         // form handling
    //         dashboard.projectCodeInput.sendKeys(login.validProjectCode);
    //         browser.wait(EC.elementToBeClickable(dashboard.projectJoinButton), 5000, "project code input was never clickable");
    //         dashboard.projectJoinButton.click();

    //         // verification
    //         browser.wait(EC.urlContains("project"), 5000, "entering a project code did not bring me to a project");
    //     });
    // });

}); // describe 'Dashboard Page'