import * as path from 'path'
import { browser, by, element, protractor } from 'protractor'
import { NewReading, Login, Sidebar, Dashboard } from './page-objects'
import { reset } from './utils/browser-methods'

describe('New Reading Page', () => {
  let newReading = new NewReading()
  let login = new Login()
  let sidebar = new Sidebar()
  let dashboard = new Dashboard()
  let EC = protractor.ExpectedConditions

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.botUser, login.botPassword)
  })

  beforeEach(() => {
    reset()
    newReading.getPage()
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

  it('should add reading when all fields are filled and submitted', () => {
    const uniqueTitle = newReading.titleString
    // Enter sample Reading into form
    newReading.titleInput.sendKeys(uniqueTitle)
    // Make private to avoid needing grade levels and subjecst
    newReading.privateButton.click()
    newReading.contentInput.sendKeys(newReading.contentShortString)
    // Submit New Reading
    newReading.clickShareAndArchive()
    browser.wait(EC.invisibilityOf(newReading.confirmArchiveModal), 5000, 'confirm archive modal should not be showing')
    browser.wait(
      EC.elementToBeClickable(newReading.finalizeButton),
      8000,
      'finalize reading button never became clickable',
    )
    // Group Label has content prefilled, so we clear it
    newReading.groupInput.clear()
    newReading.groupInput.sendKeys(newReading.groupString)
    // Save first group
    newReading.finalizeButton.click()
    // Should redirect to Project page for new reading
    browser.wait(EC.urlContains('project'), 5000, 'never arrived at new reading')
    // Give Optimus/Elastic a BRIEF moment to index the new reading
    browser.sleep(100)
    // clean up after this test
    dashboard.deleteReadingByTitle(uniqueTitle)
  })

  it('should display an error if the title is not filled', () => {
    // Enter sample Reading into form, excluding title
    newReading.titleInput.clear()
    // Make private to avoid needing grade levels and subjects
    newReading.privateButton.click()
    newReading.contentInput.sendKeys(newReading.contentShortString)
    // Submit New Reading
    newReading.addNewReading()
    // Should see error for empty title
    browser.wait(EC.presenceOf(newReading.titleError), 5000, 'never saw an error for empty title')
  })

  it('should display an error if no content is entered', () => {
    // Enter sample Reading data into form, but clear content
    newReading.titleInput.sendKeys(newReading.titleString)
    newReading.contentInput.clear()
    // Submit New Reading
    newReading.addNewReading()
    // Should see error for empty content
    browser.wait(EC.presenceOf(newReading.contentError), 5000, 'never saw an error for empty content')
  })

  it('should display an error if no group label is entered', () => {
    // Enter sample Reading into form, but clear group label
    newReading.titleInput.sendKeys(newReading.titleString)
    // Make private to avoid needing grade levels and subjecst
    newReading.privateButton.click()
    newReading.contentInput.sendKeys(newReading.contentShortString)
    newReading.clickShareAndArchive()
    browser.wait(EC.elementToBeClickable(newReading.groupInput), 5000, 'group input became clickable')
    // This field needs special attention to trigger the required
    newReading.groupInput.clear().then(() => {
      newReading.groupInput.sendKeys(' ')
      newReading.groupInput.sendKeys(protractor.Key.BACK_SPACE)
    })
    // Submit New Reading to trigger error
    browser.wait(
      EC.elementToBeClickable(newReading.finalizeButton),
      5000,
      'save reading button never became clickable after content add',
    )
    newReading.finalizeButton.click()
    // Should see error for empty group label
    browser.wait(EC.presenceOf(newReading.groupError), 5000, 'never saw an error for empty group label')
    // Close New Group modal
    newReading.newGroupModalClose.click()
  })

  describe('Reading draft', () => {
    it('should add a reading as a draft and return to the same screen with a reading id', function() {
      // Should begin at New Reading page
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
      // Enter sample Reading into form
      newReading.titleInput.sendKeys(newReading.titleString)
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()
      // Content fill
      newReading.contentInput.sendKeys(newReading.contentShortString)
      newReading.contentInput.sendKeys(protractor.Key.RETURN)
      // Saving Source is tested in the step
      newReading.sourceInput.sendKeys(newReading.sourceString)
      // Submit New Draft for Reading
      newReading.saveDraftNewReading()
      // Return to top where success message shows
      browser.executeScript('window.scrollTo(0, 0)').then(() => {
        // Should redirect to new reading page with a reading id and a success alert
        browser.wait(EC.visibilityOf(newReading.successAlert), 15000, 'never saw the success alert')
      })
      // Add more text
      newReading.contentInput.sendKeys(newReading.contentShortStringB)
      // Submit New Reading
      newReading.clickShareAndArchive()
      browser.wait(
        EC.elementToBeClickable(newReading.finalizeButton),
        5000,
        'finalize reading button never became clickable',
      )
      newReading.finalizeButton.click()
      // Should create a new Reading
      browser.wait(EC.urlContains('project'), 10000, 'never arrived at new reading')
    })

    it('should create a draft, and find it on the dashboard after manually saving', function() {
      let manualSaveTitle = 'M ' + newReading.titleString
      // Reset user to New Reading
      newReading.getPage()
      // Should begin at New Reading page
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
      // Enter sample Reading into form
      newReading.titleInput.sendKeys(manualSaveTitle)
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()
      // Content fill
      newReading.contentInput.sendKeys(newReading.contentShortString)
      newReading.contentInput.sendKeys(protractor.Key.RETURN)
      // Manually save
      newReading.draftButton.click()
      // Wait for "saved" confirmation
      browser.wait(
        EC.visibilityOf(element(by.id('draftStatusSaved'))),
        3000,
        'draft "Saved" confirmation did not appear in nav bar',
      )
      // Give Optimus/Elastic a BRIEF moment to index the new reading
      browser.sleep(100)
      // Return to dashboard
      sidebar.backToDash()
      // Verify
      browser.wait(
        EC.elementToBeClickable(element(by.cssContainingText('.draft-card__title', manualSaveTitle))),
        5000,
        'manually saved draft did not appear on dashboard',
      )
      // Delete draft
      element
        .all(by.css('.e2e-draft-delete'))
        .first()
        .click()
    })

    it('should create a draft, and find it on the dashboard after letting it autosave', function() {
      let autosaveTitle = 'A ' + newReading.titleString
      // Reset user to New Reading
      newReading.getPage()
      // Should begin at New Reading page
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
      // Enter sample Reading into form
      newReading.titleInput.sendKeys(autosaveTitle)
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()
      // Content fill
      newReading.contentInput.sendKeys(newReading.contentShortString)
      newReading.contentInput.sendKeys(protractor.Key.RETURN)
      // Wait for autosave (fires at 5 seconds)
      browser.sleep(5000)
      // Wait for "saved" confirmation
      browser.wait(
        EC.visibilityOf(element(by.id('draftStatusSaved'))),
        3000,
        'draft "Saved" confirmation did not appear in nav bar',
      )
      // Give Optimus/Elastic a BRIEF moment to index the new reading
      browser.sleep(100)
      // Return to dashboard
      sidebar.backToDash()
      // Verify
      browser.wait(
        EC.elementToBeClickable(element(by.cssContainingText('.draft-card__title', autosaveTitle))),
        5000,
        'auto-saved draft did not appear on dashboard',
      )
      // Delete draft
      element
        .all(by.css('.e2e-draft-delete'))
        .first()
        .click()
    })
  })

  describe('Preview reading formatting', () => {
    it('should preview basic formatting, and see expected formatting', function() {
      // Reset user to New Reading
      newReading.getPage()
      // Should begin at New Reading page
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000)
      // Enter sample Reading into form
      newReading.titleInput.sendKeys('Format Test')
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()
      // Verify preview doesn't open if reading content is empty
      newReading.previewButton.click()
      browser.wait(EC.presenceOf(newReading.contentError), 5000, 'never saw an error for empty content when previewing')
      browser.wait(EC.invisibilityOf(newReading.previewContent))
      // Set content to formatted html
      browser.executeScript(`arguments[0].innerHTML = "${newReading.contentHtml}";`, newReading.contentInput)
      // Trigger model update after messing with the DOM
      newReading.contentInput.sendKeys(protractor.Key.RETURN)
      // Open Reading Preview
      newReading.previewButton.click()
      // Verify preview modal has appeared
      browser.wait(EC.visibilityOf(newReading.previewContent), 3000, 'Reading Preview did not become visible')
      // Check formatting: Bold
      browser.wait(
        EC.visibilityOf(element(by.cssContainingText('.b.w', 'Bold'))),
        3000,
        'bold text did not appear in the Reading Preview',
      )
      // Check formatting: Link
      browser.wait(
        EC.visibilityOf(element(by.cssContainingText('a.w', 'Link'))),
        3000,
        'link with text did not appear in the Reading Preview',
      )
      // Close preview modal
      newReading.previewClose.click()
    })
  })
})
