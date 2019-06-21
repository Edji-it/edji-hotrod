import { browser, by, element, protractor } from 'protractor'

import { Project, Sidebar, Home, Login, Dashboard } from './page-objects'
import { LoginModal, GuestLoginForm } from './components'
import { reset } from './utils/browser-methods'

describe('Project Page', () => {
  let project = new Project()
  let home = new Home()
  let sidebar = new Sidebar()
  let loginModal = new LoginModal()
  let EC = protractor.ExpectedConditions
  let guestForm = new GuestLoginForm()
  let login = new Login()
  let dashboard = new Dashboard()

  afterEach(() => {
    browser.manage().logs().get('browser').then(browserLog => {
      if (browserLog.length > 0) {
        browserLog.forEach(log => {
          console.error(log.message)
        })
      }
    })
  })

  describe('Commenting', () => {
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
      browser.wait(EC.elementToBeClickable(element(by.css(".w[index='18']"))), 10000, 'never found words to click on')
      // Select words using Quick Highlight by clicking
      project.word(26).click()
      project.word(30).click()
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
      const dollaDolla = project.getEmojiFromKeyboard("[dataname=':dollar:'")
      browser.wait(EC.elementToBeClickable(dollaDolla), 5000, 'never scrolled to the dollars emoji')
      dollaDolla.click()

      // Save emoji comment
      project.emojiCommentSave.click()

      // delete the comment
      browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, 'could not find delete button')
      project.emojiCommentDelete.click()

      // close the comment pane
      browser.wait(EC.elementToBeClickable(project.closePane), 5000, 'could not find close pane button')
      project.closePane.click()
    })

    it('should make a comment on an image by clicking on image', async () => {
      // Find and click on image
      browser.wait(EC.presenceOf(project.image), 10000, 'never found the image')
      await browser.executeScript('window.scrollTo(0, document.querySelector("article .img-wrap > img").scrollTop);')
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
      browser.wait(EC.elementToBeClickable(project.emojiCommentDelete), 5000, 'could not find delete button')
      project.emojiCommentDelete.click()
      // make sure it's deleted
      browser.wait(EC.invisibilityOf(project.textCommentInput), 5000, 'text comment never went away after deleting it')
      // close the comment pane
      browser.wait(EC.elementToBeClickable(project.closePane), 5000, 'could not find close pane button')
      project.closePane.click()
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

      // wait 3 seconds for the audio to record
      browser.sleep(3000)

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
      browser.wait(EC.elementToBeClickable(project.commentDelete), 5000, 'could not find delete button')
      project.commentDelete.click()
      // Verify the audio comment is gone
      browser.wait(EC.invisibilityOf(project.commentDelete), 5000, 'audio comment never went away after deleting it')
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
      project.addTextReplyBtn.click()
      browser.wait(
        EC.presenceOf(element(by.css('textarea.text-comment-input'))),
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
  })

  describe('Live Notifications', () => {
    beforeAll(() => {
      login.loginAndVerify(login.studentUser, login.studentPassword)
      project.getPage('test-comment') // update
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
    })

    it('should open a project with the query param for a live reply and see that reply', () => {
      let replyId = '5d0c1fa191c20f0a8d2982d1' // update
      // verify the query param shows up in the url
      browser.wait(EC.urlContains(`#comment-${replyId}`), 15000, 'live reply query param never showed in project url')
      // should see the toast
      browser.wait(EC.visibilityOf(dashboard.toast), 3000, 'should see the toast message')
      // verify the comment pane opens
      browser.wait(EC.visibilityOf(project.closePane), 3000, 'comment pane never opened up')
      // verify we scroll to the reply and can see it
      browser.wait(EC.visibilityOf(element(by.id(`#comment-${replyId}`))), 3000, 'never found the reply comment')
    })
  })
})