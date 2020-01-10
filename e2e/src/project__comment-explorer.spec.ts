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

  describe('Teacher using comment explorer', () => {
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
      // Wait for Explorer to open
      browser.sleep(500)
      browser.wait(
        EC.elementToBeClickable(element(by.css('edji-comment'))),
        5000,
        'comments did not appear in Explorer',
      )
      // Filter on first student's comments
      let commentAuthorLinks = element.all(by.css('.comment__user-link'))
      // Get first name, then click it to filter
      let firstName: string = await commentAuthorLinks.first().getText()
      commentAuthorLinks.first().click()
      // Wait for header
      browser.wait(
        EC.visibilityOf(explorer.userHeader),
        5000,
        'did see user filter after clicking user name on comment',
      )
      // Let content load
      explorer.waitForLoad()
      // Ensure URL is updated with line parameter
      expect(browser.getCurrentUrl()).toContain('student=')
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

    it('should open a comment, view line, and see comment line', () => {
      let commentPortals = element.all(by.css('avatar-portal:not(.hide) .user-icon__wrap'))
      browser.wait(
        EC.elementToBeClickable(commentPortals.first()),
        3000,
        'comment portal did not become clickable after explorer',
      )
      commentPortals.first().click()
      // Wait for comment bubble to open, then view line
      browser.wait(
        EC.elementToBeClickable(project.viewLine),
        5000,
        'comment bubble did not opening when clicking portal',
      )
      project.viewLine.click()
      // Wait for explorer to open, verify
      browser.wait(
        EC.visibilityOf(explorer.lineHeader),
        6000,
        'clicking comment portal did not open explorer "Viewing Line"',
      )
      // Ensure URL is updated with line parameter
      expect(browser.getCurrentUrl()).toContain('line=')
    })

    // Test viewing comments on a phrase
    it('should view comments on a selection', async () => {
      // Selection 458 - 494 (exact) has at least one comment
      browser.wait(EC.elementToBeClickable(project.word(458)), 3000, 'never found words to click on')
      project.word(458).click()
      browser.sleep(300) // allow for quick select animation
      project.word(494).click()
      // View Comments
      browser.wait(
        EC.elementToBeClickable(project.viewCommentBtn),
        5000,
        'View Words selection option did not become clickable',
      )
      project.viewCommentBtn.click()
      // Should see "Phrase"/Indices view in Explorer
      browser.wait(EC.visibilityOf(explorer.viewHeader), 5000, 'selected phrase did not show in Explorer')
      let commentCount = await element.all(by.css('.sliding-pane-comment edji-comment')).count()
      // We expect at least one comment on the selection
      expect(commentCount).toBeGreaterThan(0)
      // Ensure URL is updated with selection indices
      expect(browser.getCurrentUrl()).toContain('start=458&end=494')
    })

    // Useful to test after opening the Explorer for other purposes
    it('should search for a comment after viewing line', async () => {
      // Return to all Comments
      browser.wait(
        EC.elementToBeClickable(explorer.allComments),
        3000,
        '"All Comments" was not an option while viewing a line',
      )
      explorer.allComments.click()
      browser.wait(
        EC.elementToBeClickable(explorer.searchComments),
        3000,
        '"Search" was not an option while viewing all comments',
      )
      explorer.searchComments.click()
      // Verify search header
      browser.wait(EC.visibilityOf(explorer.searchHeader), 6000, 'search button did not open search view')
      // Input search term
      browser.wait(EC.elementToBeClickable(explorer.searchInput), 3000, 'search input did not become available')
      // We expect "testhero" to contain
      explorer.searchInput.sendKeys('test')
      explorer.searchInput.sendKeys(protractor.Key.ENTER)
      // Verify results load
      let commentResults = element.all(by.css('.sliding-pane-comment edji-comment'))
      browser.wait(EC.visibilityOf(commentResults.first()), 5000, 'comments did not show when searching')
      let commentCount = await element.all(by.css('.sliding-pane-comment edji-comment')).count()
      expect(commentCount).toBeGreaterThan(0)
      // Ensure URL is updated with search parameter
      expect(browser.getCurrentUrl()).toContain('search=test')
      // Clear search
      browser.wait(EC.elementToBeClickable(explorer.searchClear), 4000, 'search clear button did not become visible')
      explorer.searchClear.click()
      browser.wait(
        EC.visibilityOf(explorer.searchHeader),
        3000,
        'clearing search left search view in explorer (could not see header)',
      )
      // Enter term with no results
      explorer.searchInput.sendKeys('"zebra12345!"')
      explorer.searchInput.sendKeys(protractor.Key.ENTER)
      browser.wait(EC.visibilityOf(explorer.loading), 5000, 'did not load when typing second search term')
      browser.wait(
        EC.visibilityOf(element(by.css('.none-found-block'))),
        5000,
        'no results message did not show when results not expected',
      )
    })
  })

  describe('Student using comment explorer', () => {
    beforeAll(() => {
      project.joinProjectCodeAndLogIn('test-live', login.studentUser, login.studentPassword)
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

    it('should open My Comments in Comment Explorer', async () => {
      // Mobile check
      sidebar.ownerToolToggle()
      browser.wait(EC.elementToBeClickable(sidebar.commentsButton), 5000, 'never found the Comments owner tool button')
      sidebar.myCommentsButton.click()
      // Wait for header
      browser.wait(
        EC.visibilityOf(explorer.userHeader),
        5000,
        'did see user filter after clicking user name on comment',
      )
      // Let content load
      explorer.waitForLoad()
      browser.wait(
        EC.invisibilityOf(explorer.allHeader),
        3000,
        'still saw "All Comments" header after clicking user name on comment',
      )
      // Verify all comments only have name that was clicked
      element.all(by.css('.comment__user-link')).then(authors => {
        authors.forEach(author => {
          // Expect test account's name
          expect(author.getText()).toBe('edji-student')
        })
      })
      // Close Explorer
      explorer.close.click()
      browser.wait(EC.invisibilityOf(explorer.close), 3000, 'close button did not close comment explorer')
      // Let explorer slide out
      browser.sleep(400)
    })
  })
})
