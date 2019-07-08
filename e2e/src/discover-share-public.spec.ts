import { browser, by, element, protractor } from 'protractor'
import { Discover, Login, NewReading, Sidebar, Dashboard } from './page-objects'
import { reset } from './utils/browser-methods'

/*
    Discover Feed tests
    - Creating a new, public reading, and verifying on Discover
*/

// Now into the testing.
describe('Discover Feed - share new public reading and check feed', () => {
  /* ---- Variable Initialization --------------- */
  let login = new Login()
  let discover = new Discover()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()
  let newReading = new NewReading()
  let EC = protractor.ExpectedConditions

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginAndVerify(login.botUser, login.botPassword)
  })

  afterAll(() => {
    sidebar.logout()
  })

  afterEach(() => {
    browser
      .manage()
      .logs()
      .get('browser')
      .then(browserLog => {
        if (browserLog.length > 0) {
          browserLog.forEach(log => {
            console.error(log.message)
          })
        }
      })
  })

  it('should arrive at Discover Feed', () => {
    sidebar.navDiscover.click()
    browser.wait(EC.urlContains('discover'), 5000, 'never arrived at Discover Feed')
  })

  describe('Create new public reading, and verify it shows in Public feed', () => {
    let newPublicReadingTitle = 'Public Reading ' + new Date().valueOf()
    // Discover Feed should exist and load for every user
    it('should create new public reading as testbot', () => {
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
      browser.wait(EC.elementToBeClickable(newReading.contentInput), 5000, 'should see reading content input')
      newReading.contentInput.sendKeys(newReading.contentShortString)
      // Hit save
      newReading.clickShareAndArchive()
      // Finalize
      newReading.createGroupButtonClick()
      // Wait for navigation to hit project page after save
      browser.wait(EC.urlContains('project'), 10000, 'never arrived at published reading')
      newReading.shareCodeModalCloseClick()
      browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, 'share reading code modal never dismissed')
      // need to go back to the dashboard before logging out
      dashboard.getPage()
      browser.wait(EC.urlContains('dashboard'), 7500, 'never arrived at dashboard before logging out')
      sidebar.logout()
    })

    it("should see testbot's new public reading in public feed", async () => {
      // Login as another user
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000, 'never got the login page')
      login.loginAndVerify(login.teacherUser, login.teacherPassword)

      // Got to Discover Feed
      sidebar.navDiscover.click()
      browser.wait(EC.urlContains('discover'), 5000, 'never arrived at discover feed as sidekick user')
      browser.wait(EC.elementToBeClickable(discover.firstFeedReading), 5000, 'discover feed readings never loaded')
      // Check title of most recent readings
      let foundTitle = await discover.validateReadingTitle(newPublicReadingTitle)
      expect(foundTitle).toBeTruthy('never found testbots new reading in the discover feed')
    })
  })
})
