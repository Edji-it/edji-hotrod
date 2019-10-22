import * as path from 'path'
import { browser, protractor, element } from 'protractor'
import { NewReading, Login, Sidebar, Project, Questions, Dashboard, Home } from './page-objects'
import { GuestLoginForm } from './components'

describe('Questions', () => {
  let newReading = new NewReading()
  let login = new Login()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions
  let project = new Project()
  let guestForm = new GuestLoginForm()
  let question = new Questions()
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

  describe('Create', () => {
    beforeAll(() => {
      login.getPage()
      login.loginAndVerify(login.heroUser, login.heroPassword)
    })

    afterAll(() => {
      sidebar.logout()
    })

    it('should add reading with questions when all fields are filled and submitted', () => {
      // Open and wait for New Reading page
      dashboard.openNewReading()

      // Wait for New Reading page
      browser.wait(EC.elementToBeClickable(newReading.titleInput), 5000, 'never found the new reading title')

      // Enter sample Reading into form
      newReading.titleInput.sendKeys(newReading.qTitleString)
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()
      newReading.contentInput1.sendKeys(newReading.qContentString1)

      /**
       * Question 1
       * Add question 1 after first content added
       */
      newReading.insertQuestionButtonTap()

      // Input the question prompt
      browser.wait(
        EC.elementToBeClickable(newReading.insertQuestionPrompt),
        5000,
        'question prompt input never became clickable',
      )
      newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt1)
      // Select the following answer types: 'emoji' & 'text'
      browser.wait(
        EC.elementToBeClickable(newReading.emojiAnswerButton),
        5000,
        'answer types button never became clickable for the first question',
      )
      newReading.emojiAnswerButton.click()
      newReading.textAnswerButton.click()

      // Enter some more content after we add the question before
      newReading.contentInput2.sendKeys(newReading.qContentString2)
      // Move the cursor over to insert the next question in the middle of text
      for (let i = 0; i < 7; i++) {
        newReading.contentInput2.sendKeys(protractor.Key.ARROW_LEFT)
      }
      /**
       * Question 2
       * Add question #2, but we will add it in the middle of existing text
       */
      newReading.insertQuestionButtonTap()
      // Wait for second question to render
      browser.sleep(500)
      // Input the question prompt
      browser.wait(
        EC.elementToBeClickable(newReading.insertQuestionPrompt),
        5000,
        'question prompt input never became clickable',
      )
      newReading.insertQuestionPrompt.sendKeys(newReading.qPrompt2)
      // Select the following answer types: 'text'
      browser.wait(
        EC.elementToBeClickable(newReading.emojiAnswerButton),
        5000,
        'answer types button never became clickable for the second question',
      )
      newReading.questionByIndexAnswer(1,'text')
      // Send the input field more text
      newReading.contentInput2.sendKeys(newReading.qContentString2)
      /**
       * Question 3
       * Add question #3, also in the middle of existing text
       */
      newReading.insertQuestionButtonTap()
      // Remove the question #3
      browser.wait(
        EC.visibilityOf(newReading.questionDelete),
        5000,
        'delete question button never became clickable',
      )
      browser.executeScript('document.getElementById("question-2").scrollIntoView()').then(() => {
        // Delete Question
        newReading.questionDelete.click()
      })
      // Make sure we can add a source
      newReading.sourceInput.sendKeys(newReading.qSourceString)
      // Submit New Reading
      newReading.clickShareAndArchive()
      browser.wait(
        EC.elementToBeClickable(newReading.finalizeButton),
        5000,
        'finalize reading button never became clickable',
      )
      newReading.finalizeButton.click()
      // Should close the reading share code modal after creating a new reading
      browser.wait(EC.urlContains('project'), 10000, 'never arrived at new reading')

      browser.wait(
        EC.elementToBeClickable(newReading.shareCodeModalClose),
        5000,
        'reading share code modal never showed up',
      )
      newReading.shareCodeModalClose.click()

      // Reset user to dashboard
      sidebar.backToDash()
    })
  })

  describe('Create Answers', () => {
    beforeEach(() => {
      project.getPage('questions')

      guestForm.loginAsGuest()
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon))
    })

    afterEach(() => {
      browser.wait(EC.elementToBeClickable(sidebar.avatarActionIcon), 5000, 'never found the avatar dropdown button')
      sidebar.clickLogOutButton()
    })

    it('should make an emoji answer to a question as a guest', () => {
      browser.wait(EC.presenceOf(question.testQuestion), 5000, ' failed to find the test question')
      project.skipTutorial()
      browser.wait(
        EC.presenceOf(question.openEndedAnswerBlock),
        10000,
        'failed to find the question to add an emoji answer to',
      )

      browser.wait(EC.elementToBeClickable(question.emojiCommentBtn), 5000, 'failed to find the emoji answer button')
      question.emojiCommentBtn.click()

      browser.wait(EC.visibilityOf(question.emojiCommentSave), 5000, 'failed to find the answer confirm button')
      question.emojiCommentSave.click()

      browser.wait(
        EC.invisibilityOf(question.answerOptions),
        5000,
        'answer options should not be showing after creating an emoji answer',
      )
      browser.sleep(2000)

      browser.wait(EC.visibilityOf(question.firstAnswerDelete), 5000, 'could not find emoji answer delete button')

      question.firstAnswerDelete.click()
      browser.wait(EC.invisibilityOf(question.firstAnswer), 5000, 'answer was not deleted')
      browser.wait(
        EC.visibilityOf(question.answerOptions),
        5000,
        'answer options should be showing after the emoji answer was deleted',
      )
    })

    it('should make a text answer to a question as a guest', () => {
      browser.wait(EC.presenceOf(question.testQuestion), 5000, ' failed to find the test question')
      project.skipTutorial()
      browser.wait(
        EC.presenceOf(question.openEndedAnswerBlock),
        10000,
        'failed to find the question to add a text answer to',
      )

      browser.wait(EC.visibilityOf(question.textCommentBtn), 5000, 'failed to find the text comment button')
      question.textCommentBtn.click()

      browser.wait(EC.visibilityOf(question.textCommentInput), 5000, 'failed to find the text comment input')
      question.textCommentInput.sendKeys('ANSWER' + protractor.Key.ENTER)

      browser.wait(EC.visibilityOf(question.firstAnswer), 5000, 'failed to find the text answer')
      browser.sleep(2000)

      browser.wait(EC.visibilityOf(question.firstAnswerDelete), 5000, 'could not find text answer delete button')
      question.firstAnswerDelete.click()
      browser.wait(
        EC.invisibilityOf(question.firstAnswer),
        5000,
        'answer options should be showing after the text answer was deleted',
      )
    })
  })
})
