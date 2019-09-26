import * as path from 'path'
import { browser, by, element, protractor } from 'protractor'
import { PageObjectInterface } from './PageObjectInterface'

export class NewReading implements PageObjectInterface {
  /*
        Page Object for the New Reading page.
    */
  private EC = protractor.ExpectedConditions

  // Public Instance Variables
  public titleInput = element(by.id('readingTitle'))
  public contentInput = element.all(by.css('.medium-editor-element')).first()
  public contentInput1 = element.all(by.css('.medium-editor-element')).first()
  public contentInput2 = element.all(by.css('.medium-editor-element')).last()
  public sourceInput = element(by.id('readingSource'))
  public publicButton = element(by.id('readingMakePublic'))
  public privateButton = element(by.id('readingMakePrivate'))
  public groupInput = element(by.id('newProjectLabel'))
  public newGroupModalClose = element(by.css('#addProjectModal .close'))
  public confirmArchiveModalClose = element(by.css('#confirmArchiveModal .close'))
  public newGroupModal = element(by.id('addProjectModal'))
  public confirmArchiveModal = element(by.id('confirmArchiveModal'))
  public gradeTileK = element(by.id('gradeTile0'))
  public gradeTileU = element(by.id('gradeTile13'))
  public subjectDropdown = element(by.id('subjectDropdown'))
  public subjectFirstOption = element.all(by.css('#subjectDropdown .dropdown-item')).first()
  public addButton = element(by.id('addReadingButton'))
  public confirmArchiveButton = element(by.id('buttonConfirm'))
  public addButtonMobile = element(by.id('addReadingButtonMobile'))
  public finalizeButton = element(by.id('buttonCreateGroup'))
  public goToReadingButton = element(by.id('shareModalReadingButton'))
  public shareCodeModalClose = element(by.id('shareCodeModalClose'))
  public draftButton = element(by.id('saveDraftButton'))
  public draftButtonMobile = element(by.id('saveDraftButtonMobile'))
  public questionDelete = element.all(by.css('button.inline-delete.question-delete')).last()
  // Preview modal
  public previewButton = element(by.id('showReadingPreview'))
  public previewContent = element(by.id('readingPreviewContent'))
  public previewClose = element(by.id('readingPreviewClose'))

  public uploadImageModalButton = element(by.css('[data-test="buttonUploadImage"]'))
  public imageUploadTrigger = element(by.id('buttonBeginImageUpload'))
  public imageFileInput = element(by.css('#imageFileInput'))
  public uploadedImage = element(by.css('.upload-list-item.new'))
  public emojiAnswerButton = element(by.css('.icon-comment-emoji.icon__answer-type'))
  public textAnswerButton = element(by.css('.icon-comment-text.icon__answer-type'))

  public uploadPDfModalButton = element(by.css('#buttonUploadPdf'))
  public pdfUploadTrigger = element(by.id('buttonBeginPdfUpload'))
  public pdfFileInput = element(by.css('#pdfFileInput'))
  public insertUploadedPdf = element(by.css('.upload-list-item.new .e2e-insert-doc'))
  public insertToolToggleButton = element(by.id('buttonInsertToolToggle'))

  // Creating questions
  public insertQuestionButton = element(by.id('buttonInsertQuestion'))
  public insertQuestionButtonMobile = element(by.id('buttonInsertQuestionMobile'))
  public insertQuestionPrompt = element.all(by.css('textarea.text-comment-input')).last()

  public imageInReading = element(by.css('.content img'))
  // public imageUploadList = element.all(by.css('.upload-list-item'));

  public titleError = element(by.id('errorTitle'))
  public contentError = element(by.id('errorContent'))
  public groupError = element(by.id('msgLabelRequired'))
  public successAlert = element(by.id('msgDraftSaved'))

  public titleString = 'can_delete Test (3 Laws) ' + new Date().valueOf() // Keep titles unique
  public qTitleString = 'When and how, in early human development, did the capacity to ask questions develop?'
  public qPrompt1 = 'Do you really think this timeline is accurate?'
  public qPrompt2 = 'Are you willing to give up the information?'
  public titleImageString = 'Test: Image' + new Date().valueOf()
  public contentString =
    'Many ancient mythologies, and most modern religions include artificial people, such as the mechanical servants built by the Greek god Hephaestus[16] (Vulcan to the Romans), the clay golems of Jewish legend and clay giants of Norse legend, and Galatea, the mythical statue of Pygmalion that came to life. Since circa 400 BC, myths of Crete include Talos, a man of bronze who guarded the Cretan island of Europa from pirates.\nWashstand automaton reconstruction, as described by Philo of Byzantium (Greece, 3rd century BC).'
  public contentHtml = "<b>Bold</b><br/><a href='edji.it'>Link</a>"
  public qContentString1 = 'Text before first question.'
  public qContentString2 = 'Text. AFTER Q'
  public qSourceString =
    'https://www.quora.com/When-and-how-in-early-human-development-did-the-capacity-to-ask-questions-develop'
  public contentShortString = '1. May not cause or allow human harm.\n'
  public contentShortStringB = '2. Must obey orders given by humans.\n'
  public contentShortStringC = '3. Must protect its existence when not against laws 1 or 2.\n'
  public sourceString = 'https://en.wikipedia.org/wiki/Robot'
  public groupString = 'Test Group 001'

  public findIdExp = new RegExp(/([A-Za-z0-9]){24}/)

  // get the login page
  getPage(): void {
    browser.get('/#/new-reading')
  } // getPage() : void

  public addNewReading(): void {
    browser.wait(
      this.EC.elementToBeClickable(element(by.css('[data-test="navShareReadingBtn"]'))),
      3000,
      'share button in nav was not clickable when creating new reading',
    )
    // Click the share button for new reading no matter if it is on desktop or mobile
    this.addButton.isPresent().then(result => {
      if (result) {
        this.addButton.isDisplayed().then(result => {
          if (result) {
            browser.wait(this.EC.elementToBeClickable(this.addButton), 5000, 'never found the share reading button')
            this.addButton.click()
          } else {
            browser.wait(
              this.EC.elementToBeClickable(this.addButtonMobile),
              5000,
              'never found the share reading button',
            )
            this.addButtonMobile.click()
          }
        })
      }
    })
  }

  public saveDraftNewReading(): void {
    // Click the share button for new reading no matter if it is on desktop or mobile
    this.draftButton.isPresent().then(result => {
      if (result) {
        this.draftButton.isDisplayed().then(result => {
          if (result) {
            browser.wait(
              this.EC.elementToBeClickable(this.draftButton),
              5000,
              'add draft button never became clickable after form entry',
            )
            this.draftButton.click()
          } else {
            browser.wait(
              this.EC.elementToBeClickable(this.draftButtonMobile),
              5000,
              'add draft button never became clickable after form entry',
            )
            this.draftButtonMobile.click()
          }
        })
      }
    })
  }

  /**
   * Opens PDf modal from New Reading page
   * - Waits for animation
   */
  public openInsertPdfModal(): void {
    // Wait for form to load
    browser.wait(this.EC.elementToBeClickable(this.titleInput), 5000)
    // Trigger modal
    this.uploadPDfModalButton.click()
    // Let modal fade in
    browser.sleep(500)
  }

  /**
   * Opens Image modal from New Reading page
   * - Waits for animation
   */
  public openInsertImageModal(): void {
    // Wait for form to load
    browser.wait(this.EC.elementToBeClickable(this.titleInput), 5000)
    // Trigger modal
    this.insertImageButtonTap()
    // Let modal fade in
    browser.sleep(500)
  }

  // Click the insert image button if we're on a mobile view
  private insertImageButtonTap(): void {
    // Toggle the owner tools on mobile if the Owner Tools button is present
    this.insertToolToggleButton.isPresent().then(result => {
      if (result) {
        this.insertToolToggleButton.isDisplayed().then(result => {
          if (result) {
            // Click the Tools button to expand the insert tools options for mobile before proceeding
            browser.wait(
              this.EC.elementToBeClickable(this.insertToolToggleButton),
              5000,
              'never found the insert tool button',
            )
            this.insertToolToggleButton.click()
          }

          // Click the image upload button
          browser.wait(
            this.EC.elementToBeClickable(this.uploadImageModalButton),
            5000,
            'image upload modal button never became clickable',
          )
          this.uploadImageModalButton.click()
        })
      }
    })
  }

  // Click the insert question button if we're on a mobile view
  public insertQuestionButtonTap(): void {
    // Toggle the owner tools on mobile if the Owner Tools button is present
    this.insertToolToggleButton.isPresent().then(result => {
      if (result) {
        this.insertToolToggleButton.isDisplayed().then(result => {
          if (result) {
            // Click the Tools button to expand the insert tools options for mobile before proceeding
            browser.wait(
              this.EC.elementToBeClickable(this.insertToolToggleButton),
              5000,
              'never found the insert tool button',
            )
            this.insertToolToggleButton.click()

            // Click the question add button for mobile
            browser.wait(
              this.EC.elementToBeClickable(this.insertQuestionButtonMobile),
              5000,
              'insert question button never became clickable',
            )
            this.insertQuestionButtonMobile.click()
          } else {
            // Click the question add button for desktop
            browser.wait(
              this.EC.elementToBeClickable(this.insertQuestionButton),
              5000,
              'insert question button never became clickable',
            )
            this.insertQuestionButton.click()
          }
        })
      }
    })
  }

  public confirmArchive(): void {
    // Wait for a modal to appear (either archive or create group)
    let modal = element(by.css('.modal.show'))
    browser.wait(this.EC.visibilityOf(modal), 5000, 'archive or group modal did not show after clicking Share')
    // sleep() reason - Allow for modal fade-in
    browser.sleep(400)
    // Click the confirm archive reading button for new reading
    this.confirmArchiveButton.isPresent().then(result => {
      if (result) {
        this.confirmArchiveButton.isDisplayed().then(result => {
          browser.wait(
            this.EC.elementToBeClickable(this.confirmArchiveButton),
            6000,
            'confirm archive reading button never became clicable',
          )
          this.confirmArchiveButton.click()
        })
      }
    })
  }

  public clickShareAndArchive(): void {
    // Click share button
    this.addNewReading()
    // Confirm archive, if applicable
    this.confirmArchive()
  }

  public createGroupButtonClick(): void {
    // Click the create group button to finalize the reading
    this.finalizeButton.isPresent().then(result => {
      if (result) {
        this.finalizeButton.isDisplayed().then(result => {
          browser.wait(
            this.EC.elementToBeClickable(this.finalizeButton),
            5000,
            'finalize reading button never became clickable',
          )
          this.finalizeButton.click()
        })
      }
    })
  }

  public shareCodeModalCloseClick(): void {
    // Click the create group button to finalize the reading
    this.shareCodeModalClose.isPresent().then(result => {
      if (result) {
        this.shareCodeModalClose.isDisplayed().then(result => {
          browser.wait(
            this.EC.elementToBeClickable(this.shareCodeModalClose),
            5000,
            'share code modal close button never became clickable',
          )
          this.shareCodeModalClose.click()
        })
      }
    })
  }
} // class Login
