import { browser, by, element, protractor } from 'protractor'
import { Discover, Login, NewReading, Sidebar, Dashboard } from './page-objects'

/*
    Discover Feed tests
*/

// Now into the testing.
describe('Discover Feed', () => {

    /* ---- Variable Initialization --------------- */
    let login       = new Login()
    let discover   = new Discover()
    let dashboard = new Dashboard()
    let sidebar     = new Sidebar()
    let newReading  = new NewReading()
    let EC = protractor.ExpectedConditions

    beforeAll(() => {
        login.getPage()
        browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
        login.loginAndVerify(login.botUser, login.botPassword)
    })

    afterAll(() => {
        sidebar.logout()
    })

    it("should arrive at Discover Feed", () => {
        sidebar.navDiscover.click()
        browser.wait(EC.urlContains("discover"), 5000, "never arrived at Discover Feed")
    })

    it("should see readings in discover feed by default and switch to following view", () => {
        browser.wait(EC.elementToBeClickable(discover.firstFeedReading), 5000, "never saw first reading in discover feed public view")
        // View following feed
        discover.filterFollowing.click()
        browser.wait(discover.hasClass(discover.filterFollowing, 'active'), 5000, "following filter never became active")
    })

    it("should not see readings in following feed if not following anyone", () => {
        discover.toggleFollowEdji(false)
        browser.wait(EC.presenceOf(discover.followEdjiMsg), 7500, "never saw message to follow Edji")
        browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, "should not see readings in following feed")
    })

    it("should see readings in following feed after following Edji", () => {
        discover.toggleFollowEdji(true)
        browser.wait(EC.presenceOf(discover.firstFeedReading), 5000, "followed Edji account reading not showing")
    })

    it("should no longer see readings in following feed after unfollowing Edji", () => {
        discover.toggleFollowEdji(false)
        // Reload feed
        sidebar.navCreate.click()
        sidebar.navDiscover.click()
        browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, "followed user reading not showing")
    })

    describe("Create new public reading, and verify it shows in Public feed", () => {
        let newPublicReadingTitle = "Public Reading " + new Date().valueOf()
        // Discover Feed should exist and load for every user
        it("should create new public reading as testbot", () => {
            // Open New Reading page
            sidebar.navCreate.click()
            dashboard.openNewReading()
            browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
            // Enter Title
            newReading.titleInput.sendKeys(newPublicReadingTitle)
            // Select Grade Range
            newReading.gradeTileK.click()
            newReading.gradeTileU.click()
            // Select Subject
            newReading.subjectDropdown.click()
            newReading.subjectFirstOption.click()
            // Enter sample content
            browser.wait(EC.elementToBeClickable(newReading.contentInput), 5000, "should see reading content input")
            newReading.contentInput.sendKeys(newReading.contentShortString)
            // Hit save
            newReading.clickShareAndArchive()
            // Finalize
            newReading.createGroupButtonClick()
            // Wait for navigation to hit project page after save
            browser.wait(EC.urlContains("project"), 7500, "never arrived at published reading")
            newReading.shareCodeModalCloseClick()
            browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, "share reading code modal never dismissed")
            sidebar.logout()
        });

        it("should see testbot's new public reading in public feed", () => {
            // Login as another user
            login.getPage()
            browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
            login.loginAndVerify(login.teacherUser, login.teacherPassword)

            // Got to Discover Feed
            sidebar.navDiscover.click()
            browser.wait(EC.urlContains("discover"), 5000, "never arrived at discover feed as sidekick user")
            browser.wait(EC.elementToBeClickable(discover.firstFeedReading), 5000)
            // Check title of most recent readings
            let foundTitle = element.all(by.css('.reading-title__text'))
                .reduce((acc, el) => {
                    return el.getText().then( text => {
                        return acc || text.includes(newPublicReadingTitle)
                    }) 
                }, false)
            expect(foundTitle).toBeTruthy()
        })
    })
})