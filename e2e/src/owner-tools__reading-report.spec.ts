/**
 * Reading Report Tests
 */
import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from "./page-objects/home-page"

describe('Project Page as an owner using reading report: ', () => {
  let project = new Project()
  let loginModal = new LoginModal()
  let login = new Login()
  let sidebar = new Sidebar()
  let home = new Home()
  let EC = protractor.ExpectedConditions
  var uniqueEval: string = new Date().valueOf().toString() + '-eval'

  beforeAll(() => {
    login.getPage()
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.enterUsername(login.heroUser)
    login.enterPassword(login.heroPassword)
    browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
    login.loginButton.click()
    browser.wait(EC.urlContains("dashboard"), 5000, "never arrived at dashboard")
  })

  beforeEach(() => {
    // Id for Owner Tools Test Reading owned by Teach/Teach
    browser.get("/#/dashboard")
    // Open Reading Report project
    project.getReadingRecapPage()
  })

  afterAll(() => {
    // log out
    sidebar.logout()
  })

  /* ---- Reading Report Tests ------------------------- */

  // open the reading report and verify it's open
  it("should open the reading report and verify it's open", () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
        
    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, "never found the reading report button")
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 3000, "never saw student filter dropdown on reading report")
  })

  // verify there is a comment in the count and the count is greater than 0 for the initial student
  it("verify there is a comment in the count and the count is greater than 0 for the initial student", () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
        
    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, "never found the reading report button")
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 3000, "never saw student filter dropdown on reading report")

    // verify the comment count is greater than 0
    let gaugeValue = element(by.id("gaugeValue"))
    browser.wait(EC.visibilityOf(gaugeValue), 3000, 'not able to find the gauge value')
    gaugeValue.getText().then((count) => {
      expect(count).toBeGreaterThan(1, 'comment count is not greater than 1')
    })
  })

  // add an evaluation and verify it shows up
  it("should add an evaluation and verify it shows up", () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
        
    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, "never found the reading report button")
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 5000, "never saw student filter dropdown on reading report")

    // Add text to the evaluation field and submit it
    element(by.id("evalFormText")).sendKeys(uniqueEval)
    browser.wait(EC.elementToBeClickable(element(by.id("sendEvalBtn"))), 3000, "send evaluation button never became clickable")
    element(by.id("sendEvalBtn")).click()

    // Verify the evaluation was added
    let evaluations = element.all(by.css('.evaluation_text'))
    browser.wait(EC.textToBePresentInElement(element(by.id("evalFormText")), ''), 3000, "evaluation never was added to the report")
    evaluations.last().getText().then((evaluation) => {
      expect(evaluation).toBe(uniqueEval, 'never saw the latest evaluation get added')
    })
  })

  // close the report and make sure it closes
  it("should close the report and make sure it closes", () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
        
    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, "never found the reading report button")
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 3000, "never saw student filter dropdown on reading report")

    // Close Reading Report
    browser.wait(EC.elementToBeClickable(element(by.id("closeReadingRecap"))), 3000, "never saw close button")
    element(by.id("closeReadingRecap")).click()

    // Verify the Reading Report is closed
    browser.wait(EC.invisibilityOf(element(by.id("readingReport"))), 3000, 'reading report never closed')
  })

  // verify you can open the dropdown for student selection and change the student
  it("should verify you can open the dropdown for student selection and change the student", () => {
    sidebar.ownerToolToggle()
        
    // Open Reading Report
    browser.wait(EC.elementToBeClickable(sidebar.readingReportButton), 5000, "never found the reading report button")
    sidebar.readingReportButton.click()

    // Wait for report to open up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 3000, "never saw student filter dropdown on reading report")

    // verify the audio comment count is greater than or equal to 1 for the default (Test Hero)
    element.all(by.css('.count-block.count-block__audio'))
      .count()
      .then((count) => {
          expect(count >= 1).toBeTruthy('Test Hero audio count was supposed to be equal to or greater than 1 on the reading report')
      })

    // Click on the student dropdown to open it up
    browser.wait(EC.elementToBeClickable(element(by.id("studentSelector"))), 3000, "never saw student selection dropdown")
    element(by.id("studentSelector")).click()

    // Click on the other student in the dropdown
    browser.wait(EC.elementToBeClickable(element(by.css("li.ui-dropdown-item:nth-child(2)"))), 3000, "never saw second student in the dropdown")
    element(by.css("li.ui-dropdown-item:nth-child(2)")).click()

    // verify the audio comment count is 0 for the second student (Josh)
    element.all(by.css('.count-block.count-block__audio'))
      .count()
      .then((count) => {
          expect(count == 0).toBeTruthy('Audio count value on the reading report was supposed to change on student selection change')
      })
  })
})