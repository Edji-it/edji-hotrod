import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal, CommentExplorer } from './components'
import { Home } from './page-objects/home-page'

describe('Project Page using the comment explorer: ', () => {
  /* ---- Variable Initialization --------------- */
  let project = new Project()
  let loginModal = new LoginModal()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions // vital
  let login = new Login()
  let explorer = new CommentExplorer()

  /* ---- beforeEach ---------------------------- */

  beforeAll(() => {
    project.joinProjectCodeAndLogIn('testhero', login.heroUser, login.heroPassword)
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

  it('should open the Comment Explorer and sort', () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
    browser.wait(EC.elementToBeClickable(sidebar.commentsButton), 5000, 'never found the Comments owner tool button')
    sidebar.commentsButton.click()
    // Verify opened sorting By Time
    browser.wait(EC.visibilityOf(explorer.sortByTime), 4000, 'sort by time toggle did not become visible')
    expect(explorer.sortByTime.getAttribute('class')).toContain('active')
    browser.wait(EC.visibilityOf(explorer.timelineLine), 3000, 'should show timeline when sorting by time')
    // Toggle to sort by location
    explorer.sortByLocation.click()
    browser.wait(EC.invisibilityOf(explorer.timelineLine), 5000, 'timeline should disappear when sorting by location')
    expect(explorer.sortByLocation.getAttribute('class')).toContain('active')
    // Close Explorer
    explorer.close.click()
    browser.wait(EC.invisibilityOf(explorer.close), 3000, 'close button did not close comment explorer')
    // Let explorer slide out
    browser.sleep(400)
  })

  it('should open the Comment Explorer and filter by student', async () => {
    // Mobile check
    sidebar.ownerToolToggle()
    browser.wait(EC.elementToBeClickable(sidebar.commentsButton), 5000, 'never found the Comments owner tool button')
    sidebar.commentsButton.click()
    // Filter on first student's comments
    let commentAuthorLinks = element.all(by.css('.comment__user-link'))
    // Get first name, then click it to filter
    let firstName: string = await commentAuthorLinks.first().getText()
    commentAuthorLinks.first().click()
    // Wait for header
    browser.wait(EC.visibilityOf(explorer.userHeader), 5000, 'did see user filter after clicking user name on comment')
    browser.wait(
      EC.invisibilityOf(explorer.allHeader),
      3000,
      'still saw "All Comments" header after clicking user name on comment',
    )
    // Verify all comments only have name that was clicked
    element.all(by.css('.comment__user-link')).then(authors => {
      authors.forEach(author => {
        expect(author.getText()).toBe(firstName)
      })
    })
    // Close Explorer
    explorer.close.click()
    browser.wait(EC.invisibilityOf(explorer.close), 3000, 'close button did not close comment explorer')
    // Let explorer slide out
    browser.sleep(400)
  })

  // Useful to test after opening the Explorer for other purposes
  it('should open a comment and see comment line', () => {
    let commentPortals = element.all(by.css('avatar-portal:not(.hide) .user-icon__wrap'))
    browser.wait(
      EC.elementToBeClickable(commentPortals.first()),
      3000,
      'comment portal did not become clickable after explorer',
    )
    commentPortals.first().click()
    // Wait for explorer to open, verify
    browser.wait(
      EC.visibilityOf(explorer.lineHeader),
      6000,
      'clicking comment portal did not open explorer "Viewing Line"',
    )
  })
})
