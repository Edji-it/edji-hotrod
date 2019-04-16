import { browser, by, element, protractor } from 'protractor'
import { Discover, Login, NewReading, Sidebar, Dashboard } from './page-objects'

/*
    Discover Feed tests
*/

// Now into the testing.
describe('Discover Feed', () => {
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

  it('should arrive at Discover Feed', () => {
    sidebar.navDiscover.click()
    browser.wait(EC.urlContains('discover'), 5000, 'never arrived at Discover Feed')
  })

  it('should see readings in discover feed by default and switch to following view', () => {
    browser.wait(
      EC.elementToBeClickable(discover.firstFeedReading),
      5000,
      'never saw first reading in discover feed public view',
    )
    // View following feed
    discover.filterFollowing.click()
    browser.wait(discover.hasClass(discover.filterFollowing, 'active'), 5000, 'following filter never became active')
  })

  it('should not see readings in following feed if not following anyone', () => {
    discover.toggleFollowEdji(false)
    browser.wait(EC.presenceOf(discover.followEdjiMsg), 7500, 'never saw message to follow Edji')
    browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, 'should not see readings in following feed')
  })

  it('should see readings in following feed after following Edji', () => {
    discover.toggleFollowEdji(true)
    browser.wait(EC.presenceOf(discover.firstFeedReading), 5000, 'followed Edji account reading not showing')
  })

  it('should see the follow Edji account in following feed after unfollowing Edji', () => {
    discover.toggleFollowEdji(false)
    // Reload feed
    sidebar.navCreate.click()
    sidebar.navDiscover.click()
    browser.wait(
      EC.elementToBeClickable(discover.firstFeedReading),
      5000,
      'never saw first reading in discover feed public view',
    )
    // View following feed
    discover.filterFollowing.click()
    browser.wait(EC.presenceOf(discover.followEdjiMsg), 7500, 'never saw message to follow Edji')
    browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, 'should not see any readings in following feed')
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
      browser.wait(EC.urlContains('project'), 7500, 'never arrived at published reading')
      newReading.shareCodeModalCloseClick()
      browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, 'share reading code modal never dismissed')
      sidebar.logout()
    })

    it("should see testbot's new public reading in public feed", () => {
      // Login as another user
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
      login.loginAndVerify(login.teacherUser, login.teacherPassword)

      // Got to Discover Feed
      sidebar.navDiscover.click()
      browser.wait(EC.urlContains('discover'), 5000, 'never arrived at discover feed as sidekick user')
      browser.wait(EC.elementToBeClickable(discover.firstFeedReading), 5000)
      // Check title of most recent readings
      let foundTitle = discover.validateReadingTitle(newPublicReadingTitle)
      expect(foundTitle).toBeTruthy()
    })
  })

  describe('reading preview', () => {
    beforeAll(() => {
      sidebar.logout()
      login.getPage()
      login.loginAndVerify(login.botUser, login.botPassword)
    })

    beforeEach(() => {
      sidebar.navDiscover.click()
    })

    it('should open reading preview in discover feed and then close it', () => {
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'first reading in discover feed was not clickable',
      )
      discover.firstFeedReading.click()
      browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
      browser.wait(EC.elementToBeClickable(discover.shareReadingBtn), 5000, 'share reading button was not clickable')
      discover.closeReadingPreview()
    })

    it('should open reading preview and edit a reading then save it', () => {
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'first reading in discover feed was not clickable',
      )
      // get the title of the first reading, we will need this to compare later
      let readingTitle = discover.getReadingTitle(discover.firstFeedTitle)
      discover.firstFeedReading.click()
      browser.wait(EC.elementToBeClickable(discover.editReadingBtn), 5000, 'share reading button was not clickable')
      discover.editReadingBtn.click()
      // wait for us to hit the new reading page with the reading from the discover feed
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000, 'never arrived to the new reading page with existing reading')
      
      // grab the title of the reading for which we are editing and compare the two
      let titleValue = discover.getInputFieldText(newReading.titleInput)
      // expect(readingTitle == titleValue).toBeTruthy('the new reading we are about to create does not match what we just got from the discover feed')

      let newReadingTitle = `rp - ${new Date().valueOf()}`
      newReading.titleInput.clear()
      newReading.titleInput.sendKeys(newReadingTitle)
      // Hit save
      newReading.clickShareAndArchive()
      // Finalize
      newReading.createGroupButtonClick()
      // Wait for navigation to hit project page after save
      browser.wait(EC.urlContains('project'), 7500, 'never arrived at published reading')
      newReading.shareCodeModalCloseClick()
      browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, 'share reading code modal never dismissed')
      sidebar.logo.click()
      browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 5000, 'never got back to the dashboard')
      // Check title of most recent readings
      let foundTitle = discover.validateReadingTitle(newReadingTitle)
      expect(foundTitle).toBeTruthy()
    })

    it('should open reading preview and share a reading', () => {
      browser.wait(EC.visibilityOf(discover.firstFeedReading), 5000, 'first reading in discover feed was not clickable')
      let readingTitle = discover.getReadingTitle(discover.firstFeedTitle)
      discover.firstFeedReading.click()
      browser.wait(EC.elementToBeClickable(discover.shareReadingBtn), 5000, 'share reading button was not clickable')
      discover.shareReadingBtn.click()
      browser.wait(
        EC.invisibilityOf(discover.readingPreview),
        5000,
        'failed to close the reading preview',
      )
      // Hit save
      newReading.clickShareAndArchive()
      // Finalize
      newReading.createGroupButtonClick()
      // Wait for navigation to hit project page after save
      browser.wait(EC.urlContains('project'), 7500, 'never arrived at published reading')
      newReading.shareCodeModalCloseClick()
      browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, 'share reading code modal never dismissed')
      sidebar.logo.click()
      // Check title of most recent readings
      let foundTitle = discover.validateReadingTitle(readingTitle)
      expect(foundTitle).toBeTruthy()
    })
  })
})
