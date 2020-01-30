import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Home, Login, Dashboard } from './page-objects'
import { GuestLoginForm, CommentExplorer } from './components'

describe('Project Page - Quick Labels', () => {
  let project = new Project()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions
  let guestForm = new GuestLoginForm()
  let explorer = new CommentExplorer()

  describe('Use Quick Labels and Hashtags in comments, then filter', async () => {
    beforeAll(() => {
      project.getPage('quicklabels')
      guestForm.loginAsGuest()
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
    })

    afterAll(() => {
      sidebar.logout()
    })

    it('should make a comment and add a quick label', async () => {
      // Find and click on image
      // Find text to select
      browser.wait(EC.elementToBeClickable(project.word(1)), 10000, 'never found words to click on')

      // Select Text to comment on (should select 'world is')
      project.word(111).click()
      project.word(117).click()

      // click the tool tip
      project.addTextComment()
      // Select first Quick Label
      project.addLabelBtn.click()
      browser.wait(EC.elementToBeClickable(project.label(1)), 3000, 'Quick Label did not appear in dropdown')
      project.label(1).click()
      // Verify label was added
      let inCommentLabel = element(by.css('.text-comment-input .quick-label'))
      browser.wait(EC.visibilityOf(inCommentLabel), 3000, 'Quick label did not appear in comment after adding it')
      // add some text to the comment
      browser.wait(EC.presenceOf(project.textCommentInput), 5000, "couldn't see the text comment")
      browser
        .actions()
        .sendKeys(' some plain text and a #hashtag')
        .perform()
      // Press ENTER to save
      browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform()
      // Click Quick Label in comment to filter
      browser.sleep(500) // sleep excuse - wait for comment to save and reformat
      inCommentLabel.click()
      // Should open Explorer and show at least two comments
      explorer.waitForLoad()
      // Ensure URL is updated with label parameter
      expect(browser.getCurrentUrl()).toContain('label=')
      // Check explorer header
      browser.wait(
        EC.invisibilityOf(explorer.allHeader),
        3000,
        'still saw "All Comments" header after clicking quick label on comment',
      )
      browser.wait(
        EC.visibilityOf(explorer.labelHeader),
        3000,
        'did not find "Quick Label" header after clicking quick label on comment',
      )
      // Should find *2* comments
      let commentResults = element.all(by.css('.sliding-pane-comment edji-comment'))
      browser.wait(EC.visibilityOf(commentResults.first()), 5000, 'comments did not show when searching')
      let commentCount = await element.all(by.css('.sliding-pane-comment edji-comment')).count()
      expect(commentCount).toBe(2)
      // Try filtering by hashtag on comment, should filter down to one comment
      let hashtagLink = element(by.css('a.comment-hashtag'))
      browser.wait(EC.elementToBeClickable(hashtagLink), 3000, 'hashtag in comment was not clickable')
      hashtagLink.click()
      explorer.waitForLoad()
      // Ensure URL is updated with label parameter
      expect(browser.getCurrentUrl()).toContain('search=%22%23hashtag%22')
      // Verify only one comment
      let hashtagCommentCount = await element.all(by.css('.sliding-pane-comment edji-comment')).count()
      expect(hashtagCommentCount).toBe(1)
      // Delete the comment
      browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, 'could not find delete button')
      project.commentDelete.click()
      // Make sure it's deleted
      browser.wait(EC.invisibilityOf(project.textCommentInput), 5000, 'text comment did not go away after deleting it')
    })
  })
})
