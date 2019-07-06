import { browser, by, element, protractor } from 'protractor'
import { Dashboard, Login, NewReading, Sidebar, Home } from './page-objects'
import { LoginForm } from './components'

describe('Versioning - ', () => {
  let login = new Login()
  let dashboard = new Dashboard()
  let loginForm = new LoginForm()
  let sidebar = new Sidebar()
  let newReading = new NewReading()
  let home = new Home()
  let EC = protractor.ExpectedConditions
  var uniqueTitle: string = new Date().valueOf().toString()
  let titleUpdate = uniqueTitle + 'update'

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.enterUsername(login.heroUser)
    login.enterPassword(login.heroPassword)
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginButton.click()
    browser.wait(EC.urlContains('dashboard'), 5000, 'never arrived at dashboard')
  })

  afterEach(() => {
    sidebar.backToDash()

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

  afterAll(() => {
    sidebar.logout()
  })

  it('should see Edji in the title', () => {
    let subject = browser.getTitle()
    let result = 'Edji'
    browser.wait(EC.titleContains(result), 5000, 'Title should contain "Edji".')
  })

  it('should create a new reading with a specific title', () => {
    // Create a new reading to control it properly thru the process
    // Open and wait for New Reading page
    dashboard.openNewReading()
    browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
    // Enter sample Reading into form
    newReading.titleInput.sendKeys(uniqueTitle)
    // Select Grade Range
    newReading.gradeTileK.click()
    newReading.gradeTileU.click()
    // Select Subject
    newReading.subjectDropdown.click()
    newReading.subjectFirstOption.click()
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
  })

  it('should go to new reading page with existing reading and validate the reading; then save it as a draft', () => {
    dashboard.goToCreatedTab()

    // Make a new version of that reading
    // Click the options, then copy and edit button
    browser.wait(
      EC.elementToBeClickable(dashboard.getReadingOptionsByTitle(uniqueTitle)),
      8000,
      'reading card options button never became clickable after load',
    )
    dashboard.getReadingOptionsByTitle(uniqueTitle).click()

    browser.wait(
      EC.elementToBeClickable(element(by.css('button[testFindCopyAndEdit="' + uniqueTitle + '"]'))),
      5000,
      'copy and edit button never became clicakble after options dropdown click',
    )
    element(by.css('button[testFindCopyAndEdit="' + uniqueTitle + '"]')).click()

    // Make sure it arrives at the new reading page with the copyId query param
    browser.wait(EC.urlContains('new-reading'), 5000, 'never arrived at the new reading page')
    browser.wait(EC.urlContains('copyId'), 5000, 'never passed an ID of the previous reading')

    // Make sure the copyId is valid
    browser.wait(
      function() {
        return browser.getCurrentUrl().then(function(url) {
          return newReading.findIdExp.test(url)
        })
      },
      5000,
      'reading ID not valid',
    )

    // Add more text
    newReading.contentInput.sendKeys(newReading.contentShortStringB)

    // Update the title
    //newReading.titleInput.clear();
    newReading.titleInput.sendKeys('update')

    // Save it as a draft
    newReading.saveDraftNewReading()

    // Draft should be created in this block
    // Should redirect to new reading page with same inputs and a success alert
    browser.wait(EC.urlContains('new-reading'), 5000, 'never created the draft')
    browser.wait(EC.presenceOf(newReading.successAlert), 5000, 'never saw the success alert')
  })

  it('should open up the latest version that is a draft and publish the draft', () => {
    // Switch to the created readings tab on mobile (will simply skip if on desktop)
    dashboard.goToCreatedTab()

    // Go back in to that drafted reading
    browser.wait(
      EC.elementToBeClickable(element(by.cssContainingText('.draft-card__title', titleUpdate))),
      8000,
      'draft never became clickable after loading of reading cards',
    )
    element(by.cssContainingText('.draft-card__title', titleUpdate)).click()

    // Make sure the site arrives at the new reading page with the copyId query param
    browser.wait(EC.urlContains('new-reading'), 5000, 'never arrived at the new reading page')

    // Submit New Reading
    newReading.clickShareAndArchive()
    browser.wait(
      EC.elementToBeClickable(newReading.finalizeButton),
      5000,
      'finalize reading button never became clickable',
    )
    newReading.finalizeButton.click()

    // Reading should be published
    browser.wait(EC.urlContains('project'), 15000, 'never arrived at the finished reading')
  })

  it('should create a new group for an older version', () => {
    // Switch to the created readings tab on mobile (will simply skip if on desktop)
    dashboard.goToCreatedTab()

    // Create a new group for an older version
    // Make sure the reading cards load before moving on to the next step
    browser.wait(EC.elementToBeClickable(dashboard.firstProject), 15000, 'reading cards never loaded')

    // Verify version 1 of this reading is in the list
    browser.wait(
      EC.elementToBeClickable(element(by.css('[testVersionNumber="' + uniqueTitle + '"]'))),
      5000,
      'past versions never loaded',
    )
    browser.wait(
      EC.elementToBeClickable(dashboard.getReadingOptionsByTitle(uniqueTitle)),
      8000,
      'reading card options for versionbutton never became clickable after load',
    )
    dashboard.getReadingOptionsByTitle(uniqueTitle).click()
    // Make sure the Create New Group button shows up and then click on it
    browser.wait(
      EC.elementToBeClickable(element(by.css('button[testFindCreateNewGroup="' + uniqueTitle + '"]'))),
      5000,
      'create new group button never became clicakble after options dropdown click',
    )
    element(by.css('button[testFindCreateNewGroup="' + uniqueTitle + '"]')).click()

    // Wait for the input field for the group label to show and enter text
    dashboard.createNewGroupModalInput(uniqueTitle + 'group')
    // Locate the group and confirm the name
    browser.wait(EC.elementToBeClickable(element(by.css('.new-project'))), 5000, 'new group label never showed up')
  })
})
