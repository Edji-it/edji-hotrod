//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor'
import { Dashboard, Login, NewReading, Sidebar } from './page-objects'
import { reset } from './utils/browser-methods'

const EC = protractor.ExpectedConditions // vital

describe('Dashboard Page as a Hero', () => {
  let login = new Login()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.heroUser, login.heroPassword)
  })

  beforeEach(() => {
    reset()
    dashboard.getPage()
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

  it('should arrive at dashboard', () => {
    browser.wait(EC.urlContains('dashboard'), 15000, 'never arrived at dashboard')
  })

  it('should paginate Created readings', async () => {
    // Wait for Readings to load into Dashboard
    browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 8000, 'never found Created Readings on Dashboard')
    // Verify the first reading title is ready
    browser.wait(
      EC.elementToBeClickable(dashboard.firstReadingTitle),
      3000,
      'never found first Created Reading title on Dashboard',
    )
    // Save title of first Reading on first page
    const firstReadingTitleStr = await dashboard.firstReadingTitle.getText()

    // Scroll to Joined pagination bar
    await browser.executeScript(
      'window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);',
    )
    browser.wait(
      EC.elementToBeClickable(dashboard.createdListNextPage),
      3000,
      'next page arrow for Created Readings did not become clickable',
    )
    // Go to next page
    dashboard.createdListNextPage.click()
    // Wait for second page load
    browser.sleep(2000) // userReadingsSource gets updated multiple times in a row, and ends up showing the same readings after loading unless there is a wait - it's pretty much invisible to the user
    browser.wait(
      EC.elementToBeClickable(dashboard.secondPageFirstReadingTitle),
      5000,
      'did not load the second page of Created Readings',
    )
    const secondPageFirstReadingTitleStr = await dashboard.secondPageFirstReadingTitle.getText()
    expect(firstReadingTitleStr).not.toEqual(
      secondPageFirstReadingTitleStr,
      'expected the first reading on the second page to have a different title than the first reading on the first page',
    )

    // Scroll back to pagination
    await browser.executeScript(
      'window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);',
    )
    browser.wait(
      EC.elementToBeClickable(dashboard.createdListPrevPage),
      3000,
      'prev page arrow for Created Readings did not become clickable',
    )
    // Go to previous page
    dashboard.createdListPrevPage.click()
    // Wait for first page load
    browser.wait(
      EC.invisibilityOf(dashboard.secondPageFirstReadingTitle),
      3000,
      'did not leave second page when trying to return to first page',
    )
  })

  // this test relies on the user having at least one project - could do more verification of the project card itself
  it('should see a list of readings and projects', () => {
    // Switch to the created readings tab on mobile (will simply skip if on desktop)
    dashboard.goToCreatedTab()

    browser.wait(EC.presenceOf(dashboard.firstReadingCard))
    expect(dashboard.readingCards.count()).toBeGreaterThan(
      0,
      'expected to see at least one reading card on the dashboard',
    )
    browser.wait(
      EC.presenceOf(dashboard.firstProject),
      8000,
      'expected to see at least one project card on the dashboard',
    )
    expect(dashboard.projectCards.count()).toBeGreaterThan(0)
  })

  // this test relies on the user having at least one project - could do more verification of the project card itself
  it('should see the join code box at multiple sizes', async () => {
    // Switch to the created readings tab on mobile (will simply skip if on desktop)
    dashboard.goToJoinedTab()
    // Verify code box
    browser.wait(EC.visibilityOf(dashboard.projectCodeInputNav), 3000, 'no join code box on full-size dashboard')
    // Stash current size
    let defaultSize = await browser
      .manage()
      .window()
      .getSize()
    // Test window size variations
    // Small Chromebook
    await browser
      .manage()
      .window()
      .setSize(1280, 720)
    browser.wait(EC.visibilityOf(dashboard.projectCodeInputNav), 3000, 'no join code box on small desktop dashboard')
    // iPad Landscape
    await browser
      .manage()
      .window()
      .setSize(1024, 768)
    browser.wait(EC.visibilityOf(dashboard.projectCodeInputNav), 3000, 'no join code box on iPad landscape dashboard')
    // iPad Portrait
    await browser
      .manage()
      .window()
      .setSize(798, 1024)
    browser.wait(EC.visibilityOf(dashboard.projectCodeInputNav), 3000, 'no join code box on iPad portrait dashboard')
    // Smaller tablet Portrait - Just below breakpoint
    await browser
      .manage()
      .window()
      .setSize(760, 1024)
    browser.wait(
      EC.visibilityOf(dashboard.projectCodeInput),
      3000,
      'no join code box on smaller tablet portrait dashboard',
    )
    // Large Phone, Portrait (Pixel XL)
    await browser
      .manage()
      .window()
      .setSize(411, 823)
    browser.wait(EC.visibilityOf(dashboard.projectCodeInput), 3000, 'no join code box on large phone dashboard')
    // Small Phone, Portrait (iPhone 6)
    await browser
      .manage()
      .window()
      .setSize(375, 667)
    browser.wait(EC.visibilityOf(dashboard.projectCodeInput), 3000, 'no join code box on small phone dashboard')
    // Reset window size
    await browser
      .manage()
      .window()
      .setSize(defaultSize.width, defaultSize.height)
  })

  /* ---- Dashboard Tests ------------------------ */

  /* Test: Can delete a project
    6.1.17
    */
  describe('Delete Readings & Projects', () => {
    it('add and delete a simple project on a reading.', () => {
      // Switch to the created readings tab on mobile (will simply skip if on desktop)
      dashboard.goToCreatedTab()

      // Click the dropdown menu
      browser.sleep(3000) // the clickOutside directive is a little finicky and will close this if you click it too fast
      browser.wait(EC.elementToBeClickable(dashboard.firstDropdownMenu), 5000, 'never saw a reading card dropdown menu')
      dashboard.firstDropdownMenu.click()
      // // Click the create new group button & create a new project
      const newGroupButton = dashboard.newGroupButton
      browser.wait(
        EC.elementToBeClickable(newGroupButton),
        5000,
        'create new group button was never clickable from dropdown menu',
      )
      newGroupButton.click()

      // Create a new group
      dashboard.createNewGroupModalInput(dashboard.uniqueGroupTitle)

      // We're gonna identify the new project by its new group class since it was just created.
      const newProjectCard = dashboard.newProjectCard
      browser.wait(EC.presenceOf(newProjectCard), 5000, 'never saw a newProjectCard')

      // Now click that delete button
      let newProjectCardDelBtn = dashboard.getGroupDeleteButton(newProjectCard)
      browser.wait(EC.elementToBeClickable(newProjectCardDelBtn), 5000, 'never saw a project delete button')
      newProjectCardDelBtn.click()

      // Click ok on that there delete modal
      browser.wait(EC.presenceOf(dashboard.groupDeleteModal), 5000, 'never saw the delete group modal')
      const deleteButton = dashboard.groupDeleteModalConfirmButton
      browser.wait(EC.presenceOf(deleteButton), 5000, 'never saw the delete group button on the delete group modal')
      browser.wait(
        EC.elementToBeClickable(deleteButton),
        5000,
        'delProjectBtn on the delProjectModal was never clickable',
      )
      deleteButton.click()
      browser.wait(EC.invisibilityOf(newProjectCard), 5000, 'still see the project card after deleting from the modal')
    })

    it('add and delete a project with Advanced Settings on a reading.', () => {
      // Switch to the created readings tab on mobile (will simply skip if on desktop)
      dashboard.goToCreatedTab()
      // Click the dropdown menu
      browser.sleep(3000) // the clickOutside directive is a little finicky and will close this if you click it too fast
      browser.wait(EC.elementToBeClickable(dashboard.firstDropdownMenu), 5000, 'never saw a reading card dropdown menu')
      dashboard.firstDropdownMenu.click()
      // // Click the create new group button & create a new project
      const newGroupButton = dashboard.newGroupButton
      browser.wait(
        EC.elementToBeClickable(newGroupButton),
        5000,
        'create new group button was never clickable from dropdown menu',
      )
      newGroupButton.click()

      // Create a new group with Advanced Settings options
      dashboard.createNewGroupModalInput(dashboard.uniqueGroupTitle, { labels: ['Test 1', 'Test 2'] })

      // We're gonna identify the new project by its new group class since it was just created.
      const newProjectCard = dashboard.newProjectCard
      browser.wait(EC.presenceOf(newProjectCard), 5000, 'never saw a newProjectCard')

      // Now click that delete button
      let newProjectCardDelBtn = dashboard.getGroupDeleteButton(newProjectCard)
      browser.wait(EC.elementToBeClickable(newProjectCardDelBtn), 5000, 'never saw a project delete button')
      newProjectCardDelBtn.click()

      // Click ok on that there delete modal
      browser.wait(EC.presenceOf(dashboard.groupDeleteModal), 5000, 'never saw the delete group modal')
      const deleteButton = dashboard.groupDeleteModalConfirmButton
      browser.wait(EC.presenceOf(deleteButton), 5000, 'never saw the delete group button on the delete group modal')
      browser.wait(
        EC.elementToBeClickable(deleteButton),
        5000,
        'delProjectBtn on the delProjectModal was never clickable',
      )
      deleteButton.click()
      browser.wait(EC.invisibilityOf(newProjectCard), 5000, 'still see the project card after deleting from the modal')
    })

    it('should get to a project by entering a code', () => {
      // Use the function to check this as it can handle multiple display types (mobile/desktop/etc)
      dashboard.enterProjectCodeFromNav(login.validProjectCode)
      // verification
      browser.wait(EC.urlContains('project'), 5000, 'entering a project code did not bring me to a project')
      // Return to dashboard
      sidebar.backToDash()
    })

    /**
     * Open project by clicking card
     * - Requires step before to reload the dashboard
     */
    it('should get to a project by clicking a card', () => {
      // Switch to the created readings tab on mobile (will simply skip if on desktop)
      dashboard.goToCreatedTab()
      browser.wait(EC.presenceOf(dashboard.firstProject), 8000, 'never saw a project')
      dashboard.projectCards.first().click()
      browser.wait(EC.urlContains('project'), 5000, 'clicking on project card did not bring me to a project')
      sidebar.backToDash()
    })
  })

  describe('Updating Public Status from Dashboard', () => {
    it('should make a private reading public', () => {
      dashboard.goToCreatedTab()
      // Wait for Readings to load into Dashboard
      browser.wait(
        EC.elementToBeClickable(dashboard.firstReadingCard),
        8000,
        'never found Created Readings on Dashboard',
      )
      // switch to bookmarked view
      browser.wait(EC.elementToBeClickable(dashboard.bookmarksBtn), 5000, 'never found bookmarks button')
      dashboard.bookmarksBtn.click()
      // input search term 'Public Status' and hit enter
      browser.wait(EC.visibilityOf(dashboard.searchInput), 5000, 'search input field was not visible')
      dashboard.searchInput.sendKeys('Public Status')
      dashboard.searchInput.sendKeys(protractor.Key.ENTER)
      // check search results
      browser.wait(EC.visibilityOf(dashboard.searchCount), 5000, 'search results were not visible')
      // verify the reading showed up
      browser.wait(
        EC.elementToBeClickable(dashboard.readingTitleText(dashboard.publicStatusTitle)),
        5000,
        'never found the public status reading',
      )
      // click toggle
      browser.wait(
        EC.elementToBeClickable(dashboard.publicToggleBtn(dashboard.publicStatusTitle)),
        5000,
        'never found the toggle public button',
      )
      dashboard.publicToggleBtn(dashboard.publicStatusTitle).click()
      // click public
      browser.wait(
        EC.elementToBeClickable(dashboard.readingMakePublic),
        5000,
        'never found the make public button on the tooltip to toggle public status',
      )
      dashboard.readingMakePublic.click()
      // verify it changed to public status
      browser.wait(EC.visibilityOf(dashboard.publicReadingStatus), 5000, 'status never changed back to public')
    })

    it('should make a public reading private', () => {
      dashboard.goToCreatedTab()
      // Wait for Readings to load into Dashboard
      browser.wait(
        EC.elementToBeClickable(dashboard.firstReadingCard),
        8000,
        'never found Created Readings on Dashboard',
      )
      // switch to bookmarked view
      browser.wait(EC.elementToBeClickable(dashboard.bookmarksBtn), 5000, 'never found bookmarks button')
      dashboard.bookmarksBtn.click()
      // input search term 'Public Status' and hit enter
      browser.wait(EC.visibilityOf(dashboard.searchInput), 5000, 'search input field was not visible')
      dashboard.searchInput.sendKeys('Public Status')
      dashboard.searchInput.sendKeys(protractor.Key.ENTER)
      // check search results
      browser.wait(EC.visibilityOf(dashboard.searchCount), 5000, 'search results were not visible')
      // verify the reading showed up
      browser.wait(
        EC.elementToBeClickable(dashboard.readingTitleText(dashboard.publicStatusTitle)),
        5000,
        'never found the public status reading',
      )
      // click toggle
      browser.wait(
        EC.elementToBeClickable(dashboard.publicToggleBtn(dashboard.publicStatusTitle)),
        5000,
        'never found the toggle public button',
      )
      dashboard.publicToggleBtn(dashboard.publicStatusTitle).click()
      // click public
      browser.wait(
        EC.elementToBeClickable(dashboard.readingMakePrivate),
        5000,
        'never found the make public button on the tooltip to toggle public status',
      )
      dashboard.readingMakePrivate.click()
      // verify it changed to public status
      browser.wait(EC.visibilityOf(dashboard.privateReadingStatus), 5000, 'status never changed back to private')
    })
  })
})

describe('Dashboard page as a sidekick', () => {
  let login = new Login()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.teacherUser, login.teacherPassword)
  })

  beforeEach(() => {
    reset()
    dashboard.getPage()
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

  it('should have only two active readings', async () => {
    const numTotalReadings = await dashboard.readingCards.count()
    const numTotalArchived = await dashboard.archivedReadingCards.count()
    expect(numTotalReadings - 2).toEqual(
      numTotalArchived,
      'expected there to be only two active readings on the free user dashboard',
    )
  })

  it('should search for readings and get results', async () => {
    // input search term and hit enter
    browser.wait(EC.visibilityOf(dashboard.searchInput), 5000, 'search input field was not visible')
    dashboard.searchInput.sendKeys('last')
    dashboard.searchInput.sendKeys(protractor.Key.ENTER)
    // check search results
    browser.wait(EC.visibilityOf(dashboard.searchCount), 5000, 'search results were not visible')
    dashboard.searchCount.getText().then(count => {
      expect(parseInt(count)).toBeGreaterThan(0, 'expected to see search results when entering a search')
    })
  })

  it('should search for readings with a bad term and get no results', async () => {
    // input search term and hit enter
    browser.wait(EC.visibilityOf(dashboard.searchInput), 5000, 'search input field was not visible')
    dashboard.searchInput.sendKeys('%')
    dashboard.searchInput.sendKeys(protractor.Key.ENTER)
    browser.sleep(1000)
    // wait for loading symbol to not be there
    browser.wait(EC.invisibilityOf(dashboard.createdListLoading), 5000, 'loading symbol never disappeared')
    // check search results
    browser.wait(EC.visibilityOf(dashboard.searchCount), 5000, 'search results were not visible')
    dashboard.searchCount.getText().then(count => {
      expect(parseInt(count)).toBe(0, 'expected to see no search results when entering a bad search')
    })
  })
})

describe('Dashboard page as a sidekick', () => {
  let login = new Login()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()
  let newReading = new NewReading()

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.adminUser, login.adminPassword)
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

  it('should make a private reading go academy', () => {
    dashboard.goToCreatedTab()
    // Wait for Readings to load into Dashboard
    browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 8000, 'never found Created Readings on Dashboard')
    // create a private reading
    let specificTitle = `academyReading${new Date().valueOf()}`
    newReading.createReadingByType('private', specificTitle)
    // verify the reading showed up
    browser.wait(
      EC.elementToBeClickable(dashboard.readingTitleText(specificTitle)),
      5000,
      'never found the new private status reading',
    )
    // click toggle
    browser.wait(
      EC.elementToBeClickable(dashboard.publicToggleBtn(specificTitle)),
      5000,
      'never found the toggle reading type button',
    )
    dashboard.publicToggleBtn(specificTitle).click()
    // click academy
    browser.wait(
      EC.elementToBeClickable(dashboard.readingMakeAcademy),
      5000,
      'never found the make academy button on the tooltip to toggle academy status',
    )
    dashboard.readingMakeAcademy.click()
    dashboard.readingTypeAddDetails()
    // verify it changed to public status
    browser.wait(EC.visibilityOf(dashboard.academyReadingStatus), 5000, 'status never changed back to academy')
  })
})
