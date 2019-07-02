import { browser, by, element, protractor } from 'protractor'
import { Discover, Login, NewReading, Sidebar, Dashboard } from './page-objects'
import { reset } from './utils/browser-methods'

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
    // Ensure we start NOT following Edji
    discover.toggleFollowEdji(false)
    // refresh if needed to unfollow Edji
    reset()
    discover.getPage()
    // View following feed
    discover.filterFollowing.click()
    browser.wait(discover.hasClass(discover.filterFollowing, 'active'), 5000, 'following filter never became active')
    browser.wait(EC.presenceOf(discover.followEdjiMsg), 7500, 'never saw message to follow Edji')
    browser.wait(EC.stalenessOf(discover.firstFeedReading), 5000, 'should not see readings in following feed')
  })

  it('should see readings in following feed after following Edji', () => {
    // Previous test ensures we are not following Edji, now follow Edji
    discover.toggleFollowEdji(true)
    // UI should load readings ON following Edji
    browser.wait(EC.presenceOf(discover.firstFeedReading), 5000, 'followed Edji account reading not showing')
  })

  it('should see the follow Edji account in following feed after unfollowing Edji', () => {
    discover.toggleFollowEdji(false)
    // Reload feed
    reset()
    discover.getPage()
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

    it('should open reading preview and edit a reading then save it', async () => {
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
      browser.wait(
        EC.elementToBeClickable(newReading.titleInput),
        5000,
        'never arrived to the new reading page with existing reading',
      )

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
      // Go directly to dashboard
      sidebar.logo.click()
      // .sleep() excuse: A previously loaded reading card causes the subsequent wait to fire too early
      browser.sleep(1000)
      browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 5000, 'never got back to the dashboard')
      // also need to wait until the draft cards load in for us to check the title
      browser.wait(EC.elementToBeClickable(dashboard.firstDraftCard), 7000, 'reading draft cards never loaded')
      // Check title of most recent readings
      // browser.wait(EC.visibilityOf(element(by.cssContainingText('.reading-title__text', newReadingTitle))), 5000, 'the newly created reading title did not match the first reading in the dashboard')
      let foundTitle = await discover.validateReadingTitle(newReadingTitle)
      expect(foundTitle).toBeTruthy('the newly created reading title did not match the first reading in the dashboard')
      reset()
      discover.getPage()
    })

    it('should open reading preview and share a reading', async () => {
      browser.wait(EC.visibilityOf(discover.firstFeedReading), 5000, 'first reading in discover feed was not clickable')
      let readingTitle = await discover.firstFeedTitle.getText()
      discover.firstFeedReading.click()
      browser.wait(EC.elementToBeClickable(discover.shareReadingBtn), 5000, 'share reading button was not clickable')
      discover.shareReadingBtn.click()
      browser.wait(
        EC.invisibilityOf(discover.readingPreview),
        5000,
        'reading preview never dismissed after clicking share button',
      )
      // Hit save
      newReading.clickShareAndArchive()
      // Finalize
      newReading.createGroupButtonClick()
      // Wait for navigation to hit project page after save
      browser.wait(EC.urlContains('project'), 7500, 'never arrived at published reading')
      newReading.shareCodeModalCloseClick()
      browser.wait(EC.invisibilityOf(newReading.shareCodeModalClose), 5000, 'share reading code modal never dismissed')
      // Go directly to dashboard
      sidebar.logo.click()
      // .sleep() excuse: A previously loaded reading card causes the subsequent wait to fire too early
      browser.sleep(1000)
      browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 5000, 'never got back to the dashboard')
      // also need to wait until the draft cards load in for us to check the title
      browser.wait(EC.elementToBeClickable(dashboard.firstDraftCard), 7000, 'reading draft cards never loaded')
      // Check title of most recent readings
      let foundTitle = await discover.validateReadingTitle(readingTitle)
      expect(foundTitle).toBeTruthy()
    })
  })

  describe('access discover feed from home page', () => {
    beforeAll(() => {
      reset()
      dashboard.getPage()
      browser.wait(EC.urlContains('dashboard'), 7500, 'never arrived at dashboard before logging out')
      sidebar.logout()
    })

    // it('should see discover feed link from the home page', () => {
    //   browser.wait(EC.elementToBeClickable(sidebar.logo), 5000, 'logo was not clickable')
    //   // go to the home page
    //   sidebar.logo.click()
    //   browser.wait(EC.elementToBeClickable(sidebar.navDiscoverPublic), 5000, 'discover feed button on home page was not clickable')
    // })

    it('should access discover feed from home page and see readings', () => {
      // browser.wait(EC.elementToBeClickable(sidebar.navDiscoverPublic), 5000, 'discover feed button on home page was not clickable')
      // sidebar.navDiscoverPublic.click()
      discover.getPage()
      browser.wait(EC.urlContains('discover'), 5000, 'never arrived at Discover Feed while not logged in')
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'never saw first reading in discover feed public view while not logged in',
      )
    })

    it('should be able to search for readings', async () => {
      // input search term and hit enter
      browser.wait(EC.visibilityOf(discover.searchInput), 5000, 'discover search input field was not visible')
      discover.searchInput.sendKeys('last')
      discover.searchInput.sendKeys(protractor.Key.ENTER)
      // check search results
      browser.wait(EC.visibilityOf(discover.searchCount), 5000, 'discover search results were not visible')
      let searchCount = await discover.searchCount.getText()
      expect(parseInt(searchCount)).toBeGreaterThan(0, 'expected to see discover search results when entering a search')
      // Clear search term
      discover.searchInput.clear()
      // Wait for default results to show again
      browser.wait(
        EC.visibilityOf(discover.searchCount),
        5000,
        'discover results were not visible after clearing search',
      )
    })

    it('should not get any readings for a bad search', async () => {
      // input search term and hit enter
      browser.wait(EC.visibilityOf(discover.searchInput), 5000, 'discover search input field was not visible')
      discover.searchInput.sendKeys('%')
      discover.searchInput.sendKeys(protractor.Key.ENTER)
      // check search results
      browser.wait(EC.visibilityOf(discover.searchCount), 5000, 'discover search results were not visible')
      browser.sleep(1000) // give browser a second to make sure the count value updates to 0
      let searchCountBad = await discover.searchCount.getText()
      expect(parseInt(searchCountBad)).toBe(0, 'expected to see no discover search results when entering a bad search')
    })

    it('should open login modal when trying to follow a user', async () => {
      browser.wait(
        EC.elementToBeClickable(discover.filterFollowing),
        5000,
        'following filter button on discover feed was not clickable',
      )
      discover.filterFollowing.click()
      discover.toggleFollowEdji(true)
      browser.wait(
        EC.visibilityOf(discover.loginModalEl),
        5000,
        'login modal never became visible after attempting to follow Edji on discover without logging in',
      )
      reset()
      discover.getPage()
    })

    it('should open reading preview and see a login button for the only reading action', async () => {
      // browser.wait(EC.elementToBeClickable(sidebar.navDiscoverPublic), 5000, 'discover feed button on home page was not clickable')
      // sidebar.navDiscoverPublic.click()
      discover.getPage()
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'first reading in discover feed was not clickable',
      )
      discover.firstFeedReading.click()
      browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
      browser.wait(
        EC.invisibilityOf(discover.shareReadingBtn),
        5000,
        'share reading action was clickable when it should not be',
      )
      browser.wait(
        EC.invisibilityOf(discover.editReadingBtn),
        5000,
        'edit reading action was clickable when it should not be',
      )
      browser.wait(
        EC.elementToBeClickable(discover.loginFromPreviewBtn),
        5000,
        'login action from reading preview was not clickable',
      )
      discover.closeReadingPreview()
    })

    it('should open reading preview, login, and see share and edit buttons for reading actions', async () => {
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'first reading in discover feed was not clickable',
      )
      discover.firstFeedReading.click()
      browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
      let firstTitle = await discover.previewTitle.getText()
      browser.wait(
        EC.elementToBeClickable(discover.loginFromPreviewBtn),
        5000,
        'login action from reading preview was not clickable',
      )
      discover.loginFromPreviewBtn.click()
      browser.wait(
        EC.visibilityOf(discover.loginModalEl),
        5000,
        'login modal never became visible after clicking login action on reading preview',
      )
      login.loginAndVerify(login.teacherUser, login.teacherPassword, 'discover')
      browser.wait(EC.visibilityOf(discover.readingPreview), 5000, 'reading preview was not visible')
      let secondTitle = await discover.previewTitle.getText()
      let sameTitle = discover.validatePreviewTitle(firstTitle, secondTitle)
      expect(sameTitle).toBeTruthy()
      browser.wait(EC.elementToBeClickable(discover.shareReadingBtn), 5000, 'share reading action was not clickable')
      browser.wait(EC.elementToBeClickable(discover.editReadingBtn), 5000, 'edit reading action was not clickable')
      discover.closeReadingPreview()
    })
  })

  describe('Strategy Templates', () => {
    beforeAll(() => {
      sidebar.logout()
      login.getPage()
      login.loginAndVerify(login.botUser, login.botPassword)
      sidebar.navDiscover.click()
    })

    it('should open strategies collection and see strategy templates banner', () => {
      browser.wait(
        EC.elementToBeClickable(discover.firstFeedReading),
        5000,
        'never saw first reading in discover feed public view',
      )
      // View strategies collection
      browser.wait(
        EC.elementToBeClickable(discover.filterStrategies),
        5000,
        'strategies collection button was not clickable',
      )
      discover.filterStrategies.click()
      browser.wait(
        EC.elementToBeClickable(discover.strategiesBanner),
        5000,
        'never saw strategies collection',
      )
    })

    it('should open strategies collection from the user dashboard', () => {
      sidebar.navCreate.click()
      // View strategies collection
      browser.wait(
        EC.elementToBeClickable(dashboard.strategiesBtn),
        5000,
        'strategies collection button was not clickable',
      )
      dashboard.strategiesBtn.click()
      browser.wait(
        EC.elementToBeClickable(discover.strategiesBanner),
        5000,
        'never saw strategies collection',
      )
    })
  })
})