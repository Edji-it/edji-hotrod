import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'

// Now into the testing.
describe('Project Page as a Co-Teacher: ', () => {
  /* ---- Variable Initialization --------------- */
  let project = new Project()
  let loginModal = new LoginModal()
  let login = new Login()
  let sidebar = new Sidebar()
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
  it('should promote student to teacher, and see confirmation toast', () => {})

  /**
   *
   */
  it('should access Reading Group as co-teacher, and have owner tools', () => {})

  /**
   *
   */
  it('should not show students "Add Teacher" option', () => {})
})
