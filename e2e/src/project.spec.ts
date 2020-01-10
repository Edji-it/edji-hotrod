import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Home, Login, Dashboard } from './page-objects'
import { LoginModal, GuestLoginForm } from './components'
import { reset } from './utils/browser-methods'
import { StudentList } from './components/student-list'

describe('Project Page', () => {
  let project = new Project()
  let home = new Home()
  let sidebar = new Sidebar()
  let studentList = new StudentList()
  let loginModal = new LoginModal()
  let EC = protractor.ExpectedConditions
  let guestForm = new GuestLoginForm()
  let login = new Login()
  let dashboard = new Dashboard()

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

  describe('Commenting and student interactions', () => {
    beforeAll(() => {
      project.getPage('test')
      guestForm.loginAsGuest()
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
    })
    beforeEach(() => {
      reset()
      project.getPage('test-comment')
    })

    afterAll(() => {
      sidebar.logout()
    })

    it('should make an emoji comment by clicking on words', () => {
      // let emojiKeyboard = project.emojiKeyboard
      let grinningEmoji = project.getEmojiFromKeyboard("[dataname=':grinning:']")
      // Code for making a comment
      // Find text to select
      browser.wait(EC.elementToBeClickable(element(by.css(".w[index='26']"))), 10000, 'never found words to click on')
      // Select words using Quick Highlight by clicking
      let firstWord = project.word(26)
      let middleWord = project.word(28)
      let lastWord = project.word(30)
      firstWord.click()
      browser.sleep(300) // allow for quick select animation
      lastWord.click()
      browser.sleep(300) // allow for quick select animation
      // Add emoji comment
      project.addEmojiComment()
      // Select emojis
      browser.wait(EC.elementToBeClickable(grinningEmoji), 5000, 'never found the emoji keyboard')
      grinningEmoji.click()
      // emojiKeyboard.element(by.css("[dataname=':heart_eyes:']")).click()
      project.getEmojiFromKeyboard("[dataname=':heart_eyes:']").click()
      // emojiKeyboard.element(by.css(".emojionearea-filter[title='Objects']")).click()
      project.getEmojiFromKeyboard(".emojionearea-filter[title='Objects']").click()

      // Use emoji keyboard filter, and type an emoji from further down
      const dollaDolla = project.getEmojiFromKeyboard("[dataname=':dollar:']")
      browser.wait(EC.elementToBeClickable(dollaDolla), 5000, 'never scrolled to the dollars emoji')
      dollaDolla.click()

      // Save emoji comment
      project.commentActionSave.click()
      // Wait for keyboard animation and highlight paint cycle
      browser.sleep(200)
      // Verify commented words have highlight (1) class
      expect(firstWord.getAttribute('class')).toContain('h-1', 'highlight class not found on first word clicked')
      expect(middleWord.getAttribute('class')).toContain(
        'h-1',
        'highlight class not found on word in between words clicked',
      )
      // delete the comment
      browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, 'could not find delete button')
      project.commentDelete.click()

      // Comment Explorer should close when only comment is deleted
    })

    it('should make a comment on an image by clicking on image', async () => {
      // Find and click on image
      browser.wait(EC.presenceOf(project.image), 10000, 'never found the image')
      await browser.executeScript(
        'window.scrollTo(0, document.querySelector("#annotatorContent .img-wrap > img").scrollTop);',
      )
      browser.wait(EC.elementToBeClickable(project.image), 5000, 'never scrolled and saw the image')
      project.image.click()
      // click the tool tip
      project.addTextComment()
      // add some text to the comment
      browser.wait(EC.presenceOf(project.textCommentInput), 5000, "couldn't see the text comment")
      browser
        .actions()
        .sendKeys('test comment')
        .perform()
      // Press ENTER to save
      browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform()

      // delete the comment
      browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, 'could not find delete button')
      project.commentDelete.click()
      // make sure it's deleted
      browser.wait(EC.invisibilityOf(project.textCommentInput), 5000, 'text comment never went away after deleting it')
      // Comment Explorer should close when only comment is deleted
    })

    it('should make audio comment by selecting text', () => {
      // Find text to select
      browser.wait(EC.elementToBeClickable(project.word(50)), 10000, 'never found words to click on')

      // Select Text to comment on (should select 'world is')
      project.word(136).click()
      project.word(142).click()

      // Add audio comment
      project.addAudioComment()

      // Wait 5 seconds for record button to become clickable and click the record audio button to start recording
      browser.wait(EC.elementToBeClickable(project.audioRecord), 7000, 'never found the record audio button')
      project.audioRecord.click()

      // wait 4 seconds for the audio to record
      browser.sleep(4000)

      // click the record audio button to end recording
      browser.wait(EC.elementToBeClickable(project.audioRecord), 5000, 'never found the record audio button')
      project.audioRecord.click()

      // Wait 5 seconds for the play audio button to become clickable (wait for audio to upload)
      browser.wait(EC.elementToBeClickable(project.audioPlay), 5000, 'never found the play audio button')
      project.audioPlay.click()

      /**
       * @todo Test restart button (failing on Circle)
       */
      // // wait 5 seconds for the restart button to become active
      // browser.wait(EC.elementToBeClickable(project.audioRestart), 5000, "could not restart the audio comment");
      // project.audioRestart.click();

      // Wait up to 3 seconds for the pause button to become active
      browser.wait(EC.elementToBeClickable(project.audioPause), 5000, 'could not pause the audio comment')
      project.audioPause.click()

      // Delete the audio comment
      browser.wait(EC.elementToBeClickable(project.commentDeleteLast), 5000, 'could not find delete button')
      project.commentDeleteLast.click()
      // Verify the audio comment is gone
      browser.wait(
        EC.invisibilityOf(project.commentDeleteLast),
        5000,
        'audio comment never went away after deleting it',
      )
    })

    it('should make a reply comment as a logged in user', () => {
      // Wait for text to load
      browser.wait(EC.elementToBeClickable(project.word(30)), 10000, 'never found words to click on')

      // create a new emoji comment
      project.createEmojiComment()

      // Wait 8 seconds for reply pane to render
      browser.wait(EC.elementToBeClickable(project.addReplyBtn), 8000, 'never found the add reply button')
      project.addReplyBtn.click()

      // Wait 5 seconds for the add text reply button to become clickable and Click on the add text reply button
      browser.wait(
        EC.elementToBeClickable(project.addTextReplyBtn),
        5000,
        'never found the add text reply comment button',
      )
      // Showing/hiding replies is causing a hiccup
      browser.sleep(400)
      project.addTextReplyBtn.click()
      browser.sleep(1000)
      browser.wait(
        EC.presenceOf(element(by.css('.text-comment-input.reply-display'))),
        5000,
        'wait for text reply input to show',
      )

      // Add text to the text input field
      // browser.wait(EC.elementToBeClickable(project.textReplyComment), 5000, "couldn't add text to the reply text comment");
      browser
        .actions()
        .sendKeys('test reply')
        .perform()
      // Press ENTER to save
      browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform()

      // Wait 5 seconds for the delete button to become clickable and then delete the reply comment
      browser.wait(
        EC.elementToBeClickable(project.replyDelete),
        5000,
        'could not find delete button on the reply comment',
      )
      project.replyDelete.click()

      // Verify the reply comment is gone
      browser.wait(
        EC.invisibilityOf(project.textReplyComment),
        5000,
        'text reply comment never went away after deleting it',
      )
    })

    /**
     * Verify students can't do things they shouldn't
     */
    it('should not give students owner tools', () => {
      // Student should see teacher names
      expect(browser.isElementPresent(sidebar.ownerName)).toBeTruthy(
        'student should see at least one owner/teacher for the reading',
      )
      // Student should not have co-teacher button
      expect(browser.isElementPresent(sidebar.addCoTeacherButton)).toBeFalsy(
        'student should not see "Add Teacher" in reading',
      )
      // Student should not see owner tools
      expect(browser.isElementPresent(sidebar.ownerTools)).toBeFalsy('student should not see Owner Tools in reading')
      // Student should not see student list toggle
      expect(browser.isElementPresent(studentList.studentListToggle)).toBeFalsy(
        'student should not see Student List toggle in reading',
      )
    })
  })

  describe('Live Notifications', () => {
    let commentId = '5d21289421d995dd649174aa'
    let replyId = '5d212ebc21d995dd649174ae'

    beforeEach(() => {
      login.getPage()
      browser.wait(EC.elementToBeClickable(login.loginButton), 5000)
      login.loginAndVerify(login.studentUser, login.studentPassword)
    })

    afterEach(() => {
      sidebar.logout()
    })

    it('should open a project with the query param for a live comment and see that comment', () => {
      project.getPage(`test-live?comment=${commentId}`)
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
      // verify the query param shows up in the url
      browser.wait(
        EC.urlContains(`?comment=${commentId}`),
        15000,
        'live comment query param never showed in project url',
      )
      // verify the comment pane opens
      browser.wait(EC.visibilityOf(project.closeComment), 5000, 'comment never opened in-line')
      // verify we scroll to the reply and can see it
      browser.wait(EC.visibilityOf(element(by.css(`#comment-${commentId}`))), 5000, 'never found the comment')
    })

    it('should open a project with the query param for a live reply and see that reply', () => {
      project.getPage(`test-live?comment=${commentId}&reply=${replyId}`)
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
      // verify the query param shows up in the url
      browser.wait(
        EC.urlContains(`?comment=${commentId}&reply=${replyId}`),
        15000,
        'live reply query param never showed in project url',
      )
      // verify the comment pane opens
      browser.wait(EC.visibilityOf(project.closeComment), 5000, 'comment never opened in-line')
      // verify we scroll to the reply and can see it
      browser.wait(
        EC.visibilityOf(element(by.css(`.comment--replyBlock[replyId="${replyId}"]`))),
        5000,
        'never found the reply',
      )
    })
  })

  describe('Word highlight comment on a PDF image', async () => {
    beforeAll(() => {
      project.getPage('test-pdf')
      guestForm.loginAsGuest()
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
    })

    afterAll(() => {
      sidebar.logout()
    })

    it('should make a comment on an image by clicking two word boxes', async () => {
      // Find and click on image
      browser.wait(EC.presenceOf(project.image), 10000, 'never found the image')
      await browser.executeScript(
        'window.scrollTo(0, document.querySelector("#annotatorContent .img-wrap > img").scrollTop);',
      )
      let firstWordBox = project.imageWordBoxes.first()
      let thirdWordBox = project.imageWordBoxes.get(2)
      browser.wait(EC.elementToBeClickable(firstWordBox), 5000, 'did not find clickable word boxes')
      firstWordBox.click()
      browser.sleep(200) // allow for quick select animation
      thirdWordBox.click()
      browser.sleep(200) // allow for quick select animation
      // Verify word boxes gained focus highlight class
      expect(firstWordBox.getAttribute('class')).toContain('h-f')
      expect(thirdWordBox.getAttribute('class')).toContain('h-f')
      // click the tool tip
      project.addTextComment()
      // add some text to the comment
      browser.wait(EC.presenceOf(project.textCommentInput), 5000, "couldn't see the text comment")
      browser
        .actions()
        .sendKeys('test comment')
        .perform()
      // Press ENTER to save
      browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform()
      // Verify selected text from PDF display with comment
      let annotatedText = await project.commentAnnotatedText.getText()
      expect(annotatedText).toContain('Page Page Page')
      // delete the comment
      browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, 'could not find delete button')
      project.commentDelete.click()
      // make sure it's deleted
      browser.wait(EC.invisibilityOf(project.textCommentInput), 5000, 'text comment did not go away after deleting it')
      // Comment Explorer should close when only comment is deleted
    })
  })
})
