//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor';
import { Discover, Login, NewReading, Sidebar, Dashboard } from './page-objects';

/*
    Discover Feed tests
*/

// Now into the testing.
describe('Discover Feed', () => {

    /* ---- Variable Initialization --------------- */
    let login       = new Login();
    let discover   = new Discover();
    let dashboard = new Dashboard();
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
    });

    afterAll(() => {
        sidebar.logout();
    });

    /* ---- Vital Super Basic Test  --------------- */
    
    // Discover Feed should exist and load for every user
    it("should arrive at Discover Feed", () => {
        sidebar.navDiscover.click();
        browser.wait(EC.urlContains("discover"), 5000, "never arrived at Discover Feed");
    });

    // Testbot follows no one by default
    it("should not see readings in following feed if not following anyone", () => {
        browser.wait(EC.presenceOf(discover.followEdjiMsg), 7500, "never saw message to follow Edji");
        browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, "should not see readings in following feed");
    });

    // Should follow Edji, then see readings from Edji in Discover Feed
    it("should see readings in following feed after following Edji", () => {
        browser.wait(EC.elementToBeClickable(discover.followEdjiTag), 5000, "never saw message to follow Edji");
        discover.followEdjiTag.click();
        browser.wait(EC.presenceOf(discover.firstFeedReading), 5000, "followed user reading not showing");
    });

    // Should unfollow Edji, and no longer see readings from Edji
    it("should no longer see readings in following feed after unfollowing Edji", () => {
        let unfollowEdjiTag = discover.unfollowTags.first()
        browser.wait(EC.elementToBeClickable(unfollowEdjiTag), 5000, "never saw message to follow Edji");
        unfollowEdjiTag.click();
        // Reload feed
        sidebar.navReadings.click();
        sidebar.navDiscover.click();
        browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, "followed user reading not showing");
    });

    // Testbot should create Public reading, and other user should see it in the global feed
    describe("Create new public reading, and verify it shows in Public feed", () => {
        let newPublicReadingTitle = "Public Reading " + new Date()
        // Discover Feed should exist and load for every user
        it("should create new public reading as testbot", () => {
            // Open New Reading page
            sidebar.navReadings.click();
            dashboard.openNewReading();
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000);
            // Enter Title
            newReading.titleInput.sendKeys(newPublicReadingTitle);
            // Select Grade Range
            newReading.gradeTileK.click();
            newReading.gradeTileU.click();
            // Select Subject
            newReading.subjectDropdown.click();
            newReading.subjectFirstOption.click();
            // Enter sample content
            browser.wait(EC.elementToBeClickable(newReading.contentInput), 5000, "should see reading content input");
            newReading.contentInput.sendKeys(newReading.contentShortString);
            // Hit save
            newReading.addNewReading()
            // Finalize
            browser.wait(EC.elementToBeClickable(newReading.finalizeButton), 5000, "finalize reading button never became clickable");
            newReading.finalizeButton.click();
            // Wait for navigation to hit project page after save
            browser.wait(EC.urlContains("project"), 5000, "never arrived at published reading");
            newReading.shareCodeModalClose.click();
            sidebar.logout();
        });

        it("should see testbot's new public reading in public feed", () => {
            // Login as another user
            sidebar.logInButton.click();
            browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
            login.enterUsername(login.teacherUser);
            login.enterPassword(login.teacherPassword);
            browser.wait(EC.elementToBeClickable(login.loginButton), 5000);
            login.loginButton.click();
            browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard");

            // Got to Discover Feed
            sidebar.navDiscover.click();
            browser.wait(EC.urlContains("discover"), 5000, "never arrived at discover feed as sidekick user");
            // View public/global feed
            discover.filterPublic.click()
            browser.wait(EC.elementToBeClickable(discover.firstFeedReading), 5000)
            // Check title of most recent readings
            let foundTitle = element.all(by.css('.reading-title__text'))
                .reduce((acc, el) => {
                    return el.getText().then( text => {
                        return acc || text.includes(newPublicReadingTitle)
                    }) 
                }, false)
            expect(foundTitle).toEqual(true)
        })
    });
}); // describe 'Dashboard Page'