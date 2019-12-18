/**
 * Reading Report Tests
 */
import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'

describe('Project Page as an owner using reading report: ', () => {
  let project = new Project()
  let loginModal = new LoginModal()
  let login = new Login()
  let sidebar = new Sidebar()
  let home = new Home()
  let EC = protractor.ExpectedConditions
  var uniqueEval: string = new Date().valueOf().toString() + '-eval'

  let recapStudentDropdown = element(by.id('studentSelector'))
  let recapStudentOptions = element.all(by.css('#studentSelector li'))
  let commentCountGauge = element.all(by.css('#gaugeValue')).get(1)
  let readingEvalFirst = element.all(by.css('.evaluation_text')).first()

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.enterUsername(login.heroUser)
    login.enterPassword(login.heroPassword)
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginButton.click()
    browser.wait(EC.urlContains('dashboard'), 5000, 'never arrived at dashboard')
    // Enter reading recap test reading code
    home.enterProjectCodeFromHome('readingrecap')
  })

  afterAll(() => {
    // log out
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

  /* ---- Reading Report Tests ------------------------- */

  it("should open the reading report and verify it's open", () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()

    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, 'never found the reading report button')
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(
      EC.elementToBeClickable(recapStudentDropdown),
      3000,
      'never saw student filter dropdown on reading report',
    )

    // Wait for Sliding Pane animation
    browser.sleep(500)
  })

  it('verify there is a comment in the count and the count is greater than 0 for the initial student', () => {
    // Select a student from dropdown
    browser.wait(EC.elementToBeClickable(recapStudentDropdown), 5000, 'recap student selector never became clickable')
    recapStudentDropdown.click()
    browser.wait(
      EC.elementToBeClickable(recapStudentOptions.get(0)),
      5000,
      'recap student dropdown options never became clickable',
    )
    recapStudentOptions.first().click()

    // verify the comment count is greater than 0
    let gaugeValue = element(by.id('gaugeValue'))
    browser.wait(EC.visibilityOf(commentCountGauge), 3000, 'not able to find the gauge value')
    commentCountGauge.getText().then(count => {
      expect(parseInt(count)).toBeGreaterThan(1, 'minutes on reading is not greater than 1')
    })
  })

  it('should add an evaluation and verify it shows up', () => {
    // Scroll down
    browser.executeScript('document.querySelector("#evalFormText").scrollIntoView()')
    browser.wait(EC.visibilityOf(readingEvalFirst), 7000, 'previous reading evals never became visible')
    browser.wait(
      EC.elementToBeClickable(element(by.id('evalFormText'))),
      3000,
      'evaluation input field never became clickable',
    )
    // Add text to the evaluation field and submit it
    element(by.id('evalFormText')).sendKeys(uniqueEval)
    browser.wait(
      EC.elementToBeClickable(element(by.id('sendEvalBtn'))),
      3000,
      'send evaluation button never became clickable',
    )
    // Scroll to button at bottom of form
    browser.executeScript('document.querySelector("#sendEvalBtn").scrollIntoView()').then(function() {
      // Send Feedback
      element(by.id('sendEvalBtn')).click()
    })
    // Verify eval input was cleared
    browser.wait(
      EC.visibilityOf(element(by.css('#sendEvalBtn:disabled'))),
      3000,
      'evaluation form did not properly submit',
    )
    // Verify eval text populated at bottom of feedback list
    browser.wait(
      EC.visibilityOf(element(by.cssContainingText('.evaluation_text', uniqueEval))),
      3000,
      'latest evaluation did not show at bottom',
    )
  })

  it('should verify you can open the dropdown for student selection and change the student', () => {
    browser.executeScript('document.querySelector(".reading-recap").scrollTo(0,0);').then(function() {
      // Select first student
      browser.wait(EC.elementToBeClickable(recapStudentDropdown), 5000, 'recap student selector never became clickable')
      recapStudentDropdown.click()
      browser.wait(
        EC.elementToBeClickable(recapStudentOptions.get(1)),
        3000,
        'recap student selector options never became clickable',
      )
      recapStudentOptions.first().click()
    })
    // verify the audio comment count is greater than or equal to 1 for the default (Test Hero)
    element
      .all(by.css('.count-block.count-block__audio'))
      .count()
      .then(count => {
        expect(count >= 1).toBeTruthy(
          'Test Hero audio count was supposed to be equal to or greater than 1 on the reading report',
        )
      })
    // Click on the student dropdown to open it up
    browser.wait(EC.elementToBeClickable(recapStudentDropdown), 3000, 'never saw student selection dropdown')
    recapStudentDropdown.click()
    // Find second student
    let secondStudent = recapStudentOptions.get(1)
    // Click on the other student in the dropdown
    browser.wait(EC.elementToBeClickable(secondStudent), 3000, 'never saw second student in the dropdown')
    secondStudent.click()
    // verify the audio comment count is 0 for the second student (Josh)
    browser.wait(
      EC.invisibilityOf(element(by.css('.count-block.count-block__audio'))),
      3000,
      'student without audio comments still showed audio comment bar',
    )
  })

  it('should close the report and make sure it closes', () => {
    browser.executeScript('document.querySelector(".reading-recap").scrollTo(0,0);').then(function() {
      // Close Reading Report
      browser.wait(EC.elementToBeClickable(element(by.id('closeReadingRecap'))), 3000, 'never saw close button')
      element(by.id('closeReadingRecap')).click()
    })

    // Verify the Reading Report is closed
    browser.wait(EC.invisibilityOf(element(by.id('readingReport'))), 3000, 'reading report never closed')
  })
})
