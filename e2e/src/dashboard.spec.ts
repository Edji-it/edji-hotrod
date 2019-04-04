//import * as webdriver from 'webdriver';
import { browser, by, element, protractor } from 'protractor'
import { Dashboard, Login, NewReading, Sidebar } from './page-objects'
import { reset } from './utils/browser-methods'

/*
    27 Jan 2017
    Last Modified: 28 Jan 2017
    Nicholas Pumper

    e2e test the dashboard page!

    - We log into all types of account.
*/

// Now into the testing.
describe('Dashboard Page as a Hero', () => {
  /* ---- Variable Initialization --------------- */
  let login = new Login()
  let dashboard = new Dashboard()
  let sidebar = new Sidebar()
  let newReading = new NewReading()
  let EC = protractor.ExpectedConditions // vital

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

  /* ---- Vital Super Basic Test  --------------- */

  /* Test: Extremely Basic Test.
    - IF THIS FAILS: You are not running Protractor correctly;
    */
  it('should arrive at dashboard', () => {
    browser.wait(EC.urlContains('dashboard'), 15000, 'never arrived at dashboard')
  })

  /**
   * Paginate Created Readings
   * - Requires "testbot" to have more than one page of Created Readings
   */
  it('should paginate Created readings', () => {
    // Wait for Readings to load into Dashboard
    browser.wait(EC.elementToBeClickable(dashboard.firstReadingCard), 8000, 'never found Created Readings on Dashboard')
    // Verify the first reading title is ready
    browser.wait(
      EC.elementToBeClickable(dashboard.firstReadingTitle),
      3000,
      'never found first Created Reading title on Dashboard',
    )
    // Save title of first Reading on first page
    let firstReadingTitleStr = ''
    dashboard.firstReadingTitle.getText().then(text => {
      firstReadingTitleStr = text + ''
      expect(text.length).toBeGreaterThan(1)
    })

    // Scroll to Joined pagination bar
    browser
      .executeScript('window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);')
      .then(() => {
        browser.wait(
          EC.elementToBeClickable(dashboard.createdListNextPage),
          3000,
          'next page arrow for Created Readings did not become clickable',
        )
      })
    // Go to next page
    dashboard.createdListNextPage.click()
    // Wait for second page load
    browser.wait(
      EC.visibilityOf(dashboard.secondPageFirstReadingTitle),
      8000,
      'did not load next page of Created Readings',
    )
    // Verify First Reading Title has changed
    expect(
      dashboard.secondPageFirstReadingTitle.getText().then(text => {
        return text === firstReadingTitleStr
      }),
    ).toBeFalsy('expected the first reading on the second page to have a different title than the first reading on the first page')
    // Scroll back to pagination
    browser
      .executeScript('window.scrollTo(0, document.querySelector(".created-list .ui-paginator-element").scrollTop);')
      .then(() => {
        browser.wait(
          EC.elementToBeClickable(dashboard.createdListPrevPage),
          3000,
          'prev page arrow for Created Readings did not become clickable',
        )
      })
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
    expect(dashboard.readingCards.count()).toBeGreaterThan(0, 'expected to see at least one reading card on the dashboard')
    browser.wait(EC.presenceOf(dashboard.firstProject), 8000, 'expected to see at least one project card on the dashboard')
    expect(dashboard.projectCards.count()).toBeGreaterThan(0)
  })

  /* ---- Dashboard Tests ------------------------ */

  /* Test: Can delete a project
    6.1.17
    */
  describe('Delete Readings & Projects', () => {
    it('Delete a project off of a new reading.', () => {
      // Switch to the created readings tab on mobile (will simply skip if on desktop)
      // dashboard.goToCreatedTab()

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

    it('Make a new reading then delete it.', () => {
      // Create Unique title for New Reading (for referencing)
      let uniqueTitle: string = new Date().valueOf().toString()
      // Create a new reading to control it properly thru the process
      dashboard.openNewReading()
      // Enter sample Reading into form
      newReading.titleInput.sendKeys(uniqueTitle)
      // Make private to avoid needing grade levels and subjects
      newReading.privateButton.click()
      newReading.contentInput.sendKeys(newReading.contentShortString)
      // Submit New Reading
      newReading.clickShareAndArchive()
      browser.wait(
        EC.elementToBeClickable(newReading.finalizeButton),
        5000,
        'finalize reading button never became clickable',
      )
      newReading.finalizeButton.click()
      // Should redirect to Project page for new reading
      browser.wait(EC.urlContains('project'), 7500, 'never arrived at the reading page after published')
      // Go to the dashboard
      sidebar.backToDash()
      // Switch to the created readings tab on mobile (will simply skip if on desktop)
      dashboard.goToCreatedTab()
      // Check for the "options" on newly created reading on Dashboard
      browser.wait(
        EC.elementToBeClickable(element(by.css('button[testFindOptions="' + uniqueTitle + '"]'))),
        8000,
        'reading card options button never became clickable after load',
      )
      // Open Reading options
      element(by.css('button[testFindOptions="' + uniqueTitle + '"]')).click()
      // Select "Delete Reading"
      browser.wait(
        EC.elementToBeClickable(element(by.css('button[testDelete="' + uniqueTitle + '"]'))),
        5000,
        'copy and edit button never became clicakble after options dropdown click',
      )
      element(by.css('button[testDelete="' + uniqueTitle + '"]')).click()
      // Find delete Reading confirmation modal
      let deleteModal = element(by.id('deleteReadingModal'))
      browser.wait(EC.presenceOf(deleteModal), 5000, 'never saw a deleteModal')
      browser.wait(EC.presenceOf(dashboard.deleteConfirm), 5000, 'never saw a deleteConfirm on the deleteModal')
      browser.wait(
        EC.elementToBeClickable(dashboard.deleteConfirm),
        5000,
        'deleteConfirm on the deleteModal was never clickable',
      )
      // Delete modal confirm click has promise issues, so treat it a bit differently
      dashboard.deleteConfirm.click()
      // Unable to confirm title
      browser.wait(
        EC.invisibilityOf(element(by.cssContainingText('.reading-title-text', uniqueTitle))),
        8000,
        "saw the unique readingTitle (END). We aren't supposed to.",
      )
    }) // it ("Make a new reading then delete it")

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
}) // describe 'Dashboard Page'
