import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Login } from './page-objects'
import { LoginModal } from './components'
import { Home } from './page-objects/home-page'

describe('Project Page as an owner wishing to filter by student: ', () => {
  /* ---- Variable Initialization --------------- */
  let project = new Project()
  let loginModal = new LoginModal()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions // vital
  let login = new Login()

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

  it('should open the Leaderboard and filter by student', () => {
    // Need to check for and click the owner tools button if its showing
    sidebar.ownerToolToggle()
    // Open Leaderboard
    browser.wait(
      EC.elementToBeClickable(sidebar.leaderboardButton),
      5000,
      'never found the leaderboard owner tool button',
    )
    sidebar.leaderboardButton.click()

    // Get comment count
    let totalCount: number
    element
      .all(by.css('edji-comment:not(.hidden)'))
      .count()
      .then(count => {
        totalCount = count
      })

    // Wait for filters to be available
    browser.wait(
      EC.elementToBeClickable(element(by.id('studentFilterBtn0'))),
      3000,
      'never saw student filter buttons in leaderboard',
    )

    // Filter by "First Commenter"'s comments
    let firstCommenterFilter = element(by.cssContainingText('.user-list__name', 'First Commenter'))
      .element(by.xpath('..'))
      .element(by.css('.e2e-student-filter'))
    browser.wait(
      EC.elementToBeClickable(firstCommenterFilter),
      3000,
      "First Commenter's student filter did not become clickable",
    )
    firstCommenterFilter.click()

    // First Commenter should only have one comment
    browser.wait(
      EC.visibilityOf(sidebar.firstCommenterFirstComment),
      3000,
      "not able to see First Commenter's comment when filtering",
    )
    sidebar.firstCommenterComments.count().then(count => {
      expect(count).toBe(1, "found more or less than First Commenter's single comment despite filtering")
    })
    // Paginate to previous Student
    browser.wait(EC.elementToBeClickable(sidebar.prevStudentButton), 5000, 'never saw "previous" student filter button')
    // Wait for animation
    browser.sleep(500)
    sidebar.prevStudentButton.click()
    // First commenter's comment should no longer be visible
    browser.wait(
      EC.invisibilityOf(sidebar.firstCommenterFirstComment),
      5000,
      "previous student filter did not hide previous student's comments",
    )
    // Close student filter
    sidebar.studentFilterClose.click()
    // Ensure First Commenter's comment is visible again
    browser.wait(
      EC.elementToBeClickable(sidebar.firstCommenterFirstComment),
      3000,
      "never saw First Commenter's comment after clearing",
    )
    // Ensure all comments are showing again
    element
      .all(by.css('edji-comment:not(.hidden)'))
      .count()
      .then(count => {
        expect(count == totalCount).toBeTruthy('all comments did not show after clearing student filter')
      })

    // close the leaderboard
    browser.wait(EC.elementToBeClickable(sidebar.leaderboardClose), 5000, 'never found the close leaderboard button')
    sidebar.closeLeaderboard()
  })

  it('should open the Leaderboard and see a live status indicator next to the user name', () => {
    sidebar.closeLeaderboard()
    // Open Leaderboard
    browser.wait(
      EC.elementToBeClickable(sidebar.leaderboardButton),
      5000,
      'never found the leaderboard owner tool button',
    )
    sidebar.leaderboardButton.click()

    browser.wait(EC.elementToBeClickable(sidebar.leaderLiveStatus), 5000, 'never found the live status indicator')

    // close the leaderboard
    browser.wait(EC.elementToBeClickable(sidebar.leaderboardClose), 5000, 'never found the close leaderboard button')
    sidebar.leaderboardClose.click()
  })
})
