//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor'
import { Dashboard, Login, NewReading, Sidebar } from './page-objects'
import { reset } from './utils/browser-methods'

const EC = protractor.ExpectedConditions // vital

describe('Dashboard Page as a Hero', () => {
  let login = new Login()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()
  let newReading = new NewReading()

  beforeAll(() => {
    // Login as test account that we can fill with junk data
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

  /* ---- Dashboard Tests ------------------------ */

  /* Test: Can delete a project
    6.1.17
    */
  describe('Delete Readings & Projects', () => {
    it('Delete a project on a reading.', () => {
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
    browser.sleep(1500)
  })

  afterAll(() => {
    sidebar.logout()
  })

  it('should have only two active readings', async () => {
    const numTotalReadings = await dashboard.readingCards.count()
    const numTotalArchived = await dashboard.archivedReadingCards.count()
    expect(numTotalReadings - 2).toEqual(numTotalArchived, 'expected there to be only two active readings on the free user dashboard')
  })

  it('should search for readings and get results', async() => {

  })

  it('should search for readings with a bad term and get no results', async() => {
    
  })
})