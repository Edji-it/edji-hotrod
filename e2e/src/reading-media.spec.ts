import * as path from 'path'
import { browser, by, element, protractor } from 'protractor'
import { NewReading, Login, Sidebar, Dashboard } from './page-objects'
import { reset } from './utils/browser-methods'

describe('Reading Media', () => {
  let newReading = new NewReading()
  let login = new Login()
  let sidebar = new Sidebar()
  let EC = protractor.ExpectedConditions

  beforeAll(() => {
    login.getPage()
    login.loginAndVerify(login.botUser, login.botPassword)
  })

  beforeEach(() => {
    reset()
    newReading.getPage()
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

  describe('PDF upload', () => {
    it('should upload a PDF to a reading and save it to the reading', function () {
      newReading.openInsertPdfModal()
      // Select File to upload
      let fileToUpload = 'assets/2-pages.pdf'
      let absolutePath = path.resolve(__dirname, fileToUpload)
      newReading.pdfFileInput.sendKeys(absolutePath)
      // Begin upload
      browser.wait(
        EC.elementToBeClickable(newReading.pdfUploadTrigger),
        10000,
        'button to upload a PDF never became clickable',
      )
      newReading.pdfUploadTrigger.click()
      // Image was uploaded! Insert it
      browser.wait(
        EC.elementToBeClickable(newReading.insertUploadedPdf),
        22000,
        'the pdf never became available to insert',
      )
      newReading.insertUploadedPdf.click()
      // Should see image in new reading
      browser.wait(EC.presenceOf(newReading.imageInReading), 10000, 'never saw PDF in the new reading')
      // Stay on New Reading page for deleting the PDF
    })

    // This following test relies on the previous one for a PDF to delete.
    it('should delete a PDF that was uploaded', function () {
      newReading.openInsertPdfModal()
      let delBtn = element(by.id('pdfDelBtn'))
      let confirmDelBtn = element(by.id('pdfDelBtnConfirm'))

      browser.wait(EC.elementToBeClickable(delBtn), 5000, 'delBtn never became clickable')
      delBtn.click()

      browser.sleep(1000) // Give the confirm modal a second to pop up before we immediately dismiss the check
      browser.wait(EC.elementToBeClickable(confirmDelBtn), 5000, 'confirm delete button never became clickable')
      confirmDelBtn.click()
    })
  })

  describe('Image upload', () => {
    it('should upload an image to a reading and save it to the reading', function () {
      newReading.openInsertImageModal()
      browser.wait(
        EC.elementToBeClickable(newReading.imageUploadBrowseButton),
        6000,
        'image browse button never became clickable',
      )

      // Select File to upload
      let fileToUpload = 'assets/titration.jpg'
      let absolutePath = path.resolve(__dirname, fileToUpload)
      newReading.imageFileInput.sendKeys(absolutePath)

      // Begin upload
      browser.wait(
        EC.elementToBeClickable(newReading.imageUploadTrigger),
        5000,
        'button to upload an image never became clickable',
      )
      newReading.imageUploadTrigger.click()

      // Image was uploaded! Insert it
      browser.wait(EC.elementToBeClickable(newReading.uploadedImage), 15000, 'never saw the image uploaded')
      newReading.uploadedImage.click()

      // Complete rest of reading
      newReading.titleInput.sendKeys(newReading.titleImageString)
      // Make private to avoid needing grade levels and subjecst
      newReading.privateButton.click()

      // Submit New Reading
      newReading.clickShareAndArchive()
      browser.wait(
        EC.elementToBeClickable(newReading.finalizeButton),
        5000,
        'finalize reading button never became clickable',
      )
      newReading.finalizeButton.click()

      // Should create a new Reading
      browser.wait(EC.urlContains('project'), 10000, 'never arrived at new reading')

      // Should see image in new reading
      browser.wait(EC.presenceOf(newReading.imageInReading), 10000, 'never saw an image in the new reading')
    })
  })
})
