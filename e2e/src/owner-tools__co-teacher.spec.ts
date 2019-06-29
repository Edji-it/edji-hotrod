import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'
import { StudentList } from './components/student-list'
import { Toasts } from './components/toasts'

// Now into the testing.
describe('Project Page as a Co-Teacher: ', () => {
  /* ---- Variable Initialization --------------- */
  let project = new Project()
  let loginModal = new LoginModal()
  let login = new Login()
  let sidebar = new Sidebar()
  let studentList = new StudentList()
  let toasts = new Toasts()
  let EC = protractor.ExpectedConditions // vital

  /* ---- before and after Each --------------- */

  beforeEach(() => {})

  afterEach(() => {
    // log out
    sidebar.logout()
  })

  /**
   * Test steps
   */

  /**
   * Simple verification of the user promotion workflow
   */
  it('should promote student to teacher, and see confirmation toast', () => {
    // Open Test project
    project.joinProjectCodeAndLogIn('coteach', login.heroUser, login.heroPassword)
    // testhero owns the "coteach" Reading, and should be able to promote users
    browser.wait(EC.elementToBeClickable(sidebar.addCoTeacherButton), 5000, 'did not see "Add Teacher" button in Nav')
    sidebar.addCoTeacherButton.click()
    // Button opens student list, where a user can be promoted from their settings
    // Wait for sliding pane transition (slidingPaneTime)
    browser.sleep(500)
    // Verify tooltip explanation shows
    browser.wait(
      EC.elementToBeClickable(studentList.coTeacherTooltip),
      3000,
      'did not display Co-Teaching tooltip after clicking "Add Teacher" button',
    )
    // Access first student's settings, and proceed to promote
    browser.wait(
      EC.elementToBeClickable(studentList.studentListFirstSettings),
      3000,
      'did not find Settings button in Student List',
    )
    studentList.studentListFirstSettings.click()
    // Select promote from dropdown
    browser.wait(
      EC.elementToBeClickable(studentList.settingsOptionPromote),
      3000,
      'did not find option to promote in Student List settings dropdown',
    )
    studentList.settingsOptionPromote.click()
    // Verify and confirm in modal
    browser.wait(
      EC.elementToBeClickable(studentList.confirmCoTeacherButton),
      3000,
      'never saw co-teacher confirmation modal button',
    )
    studentList.confirmCoTeacherButton.click()
    // Verify toast displays
    browser.wait(
      EC.visibilityOf(toasts.ToastPromoteConfirm),
      5000,
      'never saw confirmation toast for co-teacher promotion',
    )
  })

  /**
   * Simple verification of a co-teacher's access
   */
  it('should access Reading Group as co-teacher, and have owner tools', () => {
    // Open Test project as co-teacher (testbot is a co-teacher on "coteach")
    project.joinProjectCodeAndLogIn('coteach', login.botUser, login.botPassword)
    // Need to check for and click the owner tools button if its showing (mobile)
    sidebar.ownerToolToggle()
    // Verify Student List owner tool is available and toggle-able
    browser.wait(
      EC.elementToBeClickable(studentList.studentListToggle),
      3000,
      'Student List owner tool button was not available for a co-teacher',
    )
    studentList.studentListToggle.click()
    // Verify Student List shows
    browser.wait(EC.visibilityOf(studentList.content), 3000, 'Student List content did not show for a co-teacher')
    // Close
    browser.wait(EC.elementToBeClickable(studentList.close), 3000, 'Student List close button did not become clickable')
    studentList.close.click()
    browser.wait(EC.invisibilityOf(studentList.content), 3000, 'Student List did not close for co-teacher')
    // Verify co-teacher name shows in Nav
    let coTeacherTag = element(by.cssContainingText('.user-tag__name', 'Test Bot'))
    expect(EC.visibilityOf(coTeacherTag)).toBeTruthy('co-teacher name was not displayed in the Nav Bar')
  })
})
