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

  beforeEach(() => {
    browser.get('/#/home')
    // Open Test project
    project.joinProjectCodeAndLogIn('coteach', login.heroUser, login.heroPassword)
  })

  afterEach(() => {
    // log out
    sidebar.logout()
  })

  /**
   * Test steps
   */

  /**
   *
   */
  it('should promote student to teacher, and see confirmation toast', () => {
    // testhero owns the "coteach" Reading, and should be able to promote users
    browser.wait(EC.elementToBeClickable(sidebar.addCoTeacherButton), 5000, 'did not see "Add Teacher" button in Nav')
    sidebar.addCoTeacherButton.click()
    // Button opens student list, where a user can be promoted from their settings
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
   *
   */
  it('should access Reading Group as co-teacher, and have owner tools', () => {})

  /**
   *
   */
  it('should not show students "Add Teacher" option', () => {})
})
