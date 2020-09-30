import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { take } from 'rxjs/operators'

// Project Dependencies
import { MediaService, AuthService, SecretSwitchesService, BumblebeeService } from '../../_services'
import { DeletePdfMiniModal } from './delete-pdf-mini-modal/delete-pdf-mini-modal.component'
import { LockerService } from '../../_services/locker.service'
import { DocumentSpark } from '../../shared/datatypes'
import { Angulartics2 } from 'angulartics2'
import { Subscription } from 'rxjs'

@Component({
  selector: 'upload-pdf-modal',
  templateUrl: './upload-pdf-modal.component.pug',
  styleUrls: ['./upload-pdf-modal.component.scss'],
  providers: [MediaService],
})
export class UploadPdfModalComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() returnImage: EventEmitter<any> = new EventEmitter()

  private subscriptions: Subscription[] = []
  private newDocsIds: string[] = []
  private uploadUrl: string = '//grapple-dev.edji.it'
  public selectedIndex: number = 0
  public uploadedDocs: any[] = []
  public file: any = {}
  public title: string = ''
  public selectedFiles: any[] = []
  public uploading: boolean = false
  public noUploadAllowed: boolean = true
  public errorMsg: string = ''
  public errorUploadFailed: boolean = false
  public pdfFileInputId: string = 'pdfFileInput'
  public confirmDelete: boolean = false
  // Toggle Feedback/Report modal
  public showReportError: boolean = false
  public reportErrorMsg: string = ''
  public firstDocument: number = 0
  public totalDocuments: number = 1
  public supportEmail: string = 'mailto:support@edji.it'
  public pdfPageCount: number = 0

  /**
   * Temporary: PDF word highlight flag
   * @todo Clean out after full roll out
   */
  public wordHighlightsEnabled: boolean

  constructor(
    private _locker: LockerService,
    private _media: MediaService,
    private _auth: AuthService,
    private angulartics: Angulartics2,
    private _switches: SecretSwitchesService,
    private _bumblebee: BumblebeeService,
  ) {}

  ngOnInit() {
    // Load previously uploaded docs
    let previousDocs = []
    if (this._locker.get('uploadedDocs')) {
      previousDocs = this._locker.get('uploadedDocs')
    } else if (this._auth.getUser().media && this._auth.getUser().media.documents) {
      previousDocs = this._auth.getUser().media.documents
    }

    // Get the latest uploaded docs
    this._auth
      .refreshUser()
      .pipe(take(1))
      .subscribe((user: any) => {
        if (user.media && user.media.documents) {
          this.uploadedDocs = user.media.documents
          // Check existing Uploaded Docs for any not yet marked as converted
          this.uploadedDocs.forEach(doc => {
            if (doc.converted !== true && !doc.expired && !doc.error) {
              this.checkConversion(doc)
            }
          })
          // sort the pdf pages since the S3 bucket has a strange sorting policy for numbers in a string
          this.uploadedDocs = this.sortPdfPages(this.uploadedDocs)
          /**
           * @todo figure out if we should save the sorted pages to the user object and update the locker
           */
        }
      })

    this.subscriptions.push(
      this._switches.secretSwitchesUpdates.subscribe(switches => {
        if (switches['pdfWordHighlighting']) {
          this.wordHighlightsEnabled = switches['pdfWordHighlighting']
        }
      }),
    )
  }

  // Set 'file' variable and validate file
  updateUploadFile() {
    if (document.getElementById(this.pdfFileInputId) == null) {
      console.error('Could not find the pdfFileInput element!')
    }

    const files = document.getElementById(this.pdfFileInputId)['files']
    this.file = files[0]
    if (this.file.name && this.title.length < 1) {
      this.title = this.file.name
    }
    // Limit file size to 10mb and 30 pages
    if (this.file) {
      this.getPdfPageCount()
    }
    this.checkUploadWarning()
  }

  checkUploadWarning() {
    if (this.file && (this.file.size > 10 * Math.pow(10, 6) || this.pdfPageCount > 30)) {
      this.noUploadAllowed = true
      this.errorMsg = 'PDF uploads are limited to 10mb and 30 pages. Please select a smaller PDF' // Track PDF start upload failure event
      this.angulartics.eventTrack.next({
        action: `pdf_upload_fail_too-large_${this.file.size}mb_${this.pdfPageCount}pgs`,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    } else {
      this.noUploadAllowed = false
      this.errorMsg = ''
    }
  }

  getPdfPageCount() {
    const reader: any = new FileReader()
    reader.readAsBinaryString(this.file)
    reader.onloadend = async () => {
      this.pdfPageCount = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length
      this.checkUploadWarning()
    }
  }

  // Upload image and add image to modal for selection
  beginUpload() {
    this.updateUploadFile()

    if (this.file == null) {
      alert('No file selected.')
      return
    }

    if (!this.title || this.title.length < 1) {
      this.errorMsg = 'Please give your document a title.'
      return
    }

    this.uploading = true
    this.noUploadAllowed = true
    this.errorUploadFailed = false
    document.getElementById(this.pdfFileInputId)['value'] = ''

    this._media.uploadPdf(this.file).subscribe(
      data => {
        this.uploading = false
        // Set converted property
        data.converted = false
        // Set document title to copy
        data.title = (' ' + this.title).slice(1)
        // Add document to user's uploaded documents
        this.addUpload(data)
        // Clear fields
        this.file = {}
        this.title = ''
        this.noUploadAllowed = false
      },
      error => {
        this.uploading = false
        this.errorUploadFailed = true
        // Track PDF start upload failure event
        this.angulartics.eventTrack.next({
          action: 'pdf_upload_fail_start',
          properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
        })
        // send to slack alerts
        this._bumblebee.reportError({ error: 'pdf failed upload to S3 bucket' })
      },
    )

    // Track PDF Upload event
    this.angulartics.eventTrack.next({
      action: 'newReading_pdf_upload',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  // Run check until document is confirmed as processed
  checkConversion(doc): void {
    let fileId = doc.uuid
    let EXPIRE_TIME = 5 * 60 * 1000 // 5 min (Server will timeout within 4 min)
    let requestedTime = Date.parse(doc.requestedTime)

    if (doc && doc.pages && doc.pages[0] && !doc.error) {
      // Assume if document has page values, it is converted and stored
      doc.converted = true
    } else if (requestedTime && Date.now() - requestedTime > EXPIRE_TIME) {
      // If this is old, expire the document
      // NOTE: Handle expiration here to account for success OR fail on getting Spark
      doc.expired = true
      this.updateUploadedDoc(doc)
    } else if (!fileId) {
      // If no UUID is passed, assume corrupt/old  data
      doc.expired = true
    } else {
      this._media
        .getDocumentSpark(fileId)
        .pipe(take(1))
        .subscribe(
          data => {
            // Get date value in ms for comparison
            let requestedTime = Date.parse(doc.requestedTime)

            if (data.converted === true) {
              // Mark document as converted
              this.newDocsIds.push(data.uuid)
              this.updateUploadedDoc(data)
            } else if (data.error) {
              // Pass doc with error
              this.updateUploadedDoc(data)
            } else {
              // Ensure doc has requestedTime for next round
              if (!doc.requestedTime) {
                doc.requestedTime = data.updatedTime ? data.updatedTime : Date.now()
                this.updateUploadedDoc(doc)
              }
              // Check again later
              setTimeout(() => {
                this.checkConversion(doc)
              }, 3000)
            }
          },
          err => {
            // Ensure failing doc has requestedTime for expiration
            if (!doc.requestedTime) {
              doc.requestedTime = Date.now()
              this.updateUploadedDoc(doc)
            }
            // Check again later
            setTimeout(() => {
              this.checkConversion(doc)
            }, 3000)
            console.error(err)
          },
        )
    }
  }

  // Update a single document, and propagate changes
  updateUploadedDoc(updatedDoc: any) {
    this.uploadedDocs.forEach((doc, index) => {
      // We prefer "uuid", but when first uploading (or in the case of old data), we may only have the Mongo id
      if ((updatedDoc.uuid && updatedDoc.uuid === doc.uuid) || (updatedDoc._id && updatedDoc._id === doc._id)) {
        Object.assign(this.uploadedDocs[index], updatedDoc)
      }
    })
    this.saveUploadedDocs()
  }

  // Trigger the process for the user to confirm that they want to delete a PDF.
  confirmDeleteMiniModal(): void {
    this.confirmDelete = true
  }

  // Delete a PDF through front end magic. Since things are stored locally and through AWS, no need to do a server call.
  removeUploadedDoc(docToDelete: any) {
    // Since the PDF's are just stored locally, deleting an uploaded PDF is mostly
    // gonna be front end magic. We're gonna dive into the user prefs as found in
    // auth.service.ts
    // Edit our front-end listing...
    this.uploadedDocs.forEach((doc, index) => {
      if ((docToDelete.uuid && docToDelete.uuid === doc.uuid) || (docToDelete._id && docToDelete._id === doc._id)) {
        // Remove doc
        this.uploadedDocs.splice(index, 1)
      }
    })

    // and now overwrite the list of docs in user prefs so that this carries across page loads.
    this._auth.forceUpdateDocuments(this.uploadedDocs).subscribe(() => {
      // Document already removed
    })
  }

  // Add upload URL to array and localStorage
  addUpload(data: any): void {
    // Add document object
    this.uploadedDocs.unshift(data)
    // Save document object
    this.saveUploadedDocs()
    // Check if document is done converting
    this.checkConversion(data)
  }

  // Save Uploaded Doc list to localStorage AND user object
  saveUploadedDocs(): void {
    // sort the pdf pages since the S3 bucket has a strange sorting policy for numbers in a string
    this.uploadedDocs = this.sortPdfPages(this.uploadedDocs)
    this._locker.set('uploadedDocs', this.uploadedDocs)
    let user = this._auth.getUser()
    if (!user.media) {
      user.media = {}
    }
    if (!user.media.documents) {
      user.media.documents = []
    }
    user.media.documents = this.uploadedDocs
    this._auth
      .updateUser(user)
      .pipe(take(1))
      .subscribe(
        data => {
          if (data.user && data.user.media && data.user.media.documents) {
            this.uploadedDocs = user.media.documents
          }
        },
        error => {
          console.error(error)
        },
      )
  }

  /**
   * Detects if page has pdf error
   * @param doc
   * @param index
   */
  public hasWordsError(doc: DocumentSpark, index: number): boolean {
    if (doc.pdf && doc.pdf.pages && !doc.disable_words) {
      if (!doc.pdf.pages[index]) {
        // Pages that fail OCR individually will return as "null" in the pages array
        return true
      }
    }
    return false
  }

  /**
   * Output images (w/ data)
   * @param doc Document record from user's media
   * @param index? optional, individual page index
   */
  insertPages(doc: DocumentSpark, index?: number): void {
    let images: { url: string; data?: string }[] = []
    let buildImageObj = (page, i) => {
      let image = { url: page }
      // If pdf data is available, attach it
      // TEMP: Word Highlight secret switch
      if (this.wordHighlightsEnabled && doc.pdf && doc.pdf.pages && !doc.disable_words) {
        let dataUrl = doc.pdf.pages[i]
        if (dataUrl) {
          image['data'] = doc.pdf.pages[i]
        }
      }
      return image
    }

    if (typeof index === 'undefined') {
      // Loop over pages if inserting whole doc
      doc.pages.forEach((page, index) => {
        images.push(buildImageObj(page, index))
      })
    } else {
      images.push(buildImageObj(doc.pages[index], index))
    }
    // Track PDF instert event
    this.angulartics.eventTrack.next({
      action: 'newReading_pdf_insert' + (images.length > 1 ? 'Page' : 'All'),
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Send images to New Reading
    this.returnImage.emit(images)
    this.closeModal.emit()
  }

  /**
   * Toggle whether to use word highlights for a doc
   * - Storing as a preference on the spark allows for maintaining behavior
   */
  toggleWordHighlights(doc: DocumentSpark) {
    if (doc.pdf && doc.pdf.pages) {
      if (!doc.disable_words) {
        doc.disable_words = true
      } else {
        doc.disable_words = false
      }
    }
    // Track PDF word highlight toggle
    this.angulartics.eventTrack.next({
      action: 'newReading_pdf_toggleWordHighlights' + (doc.disable_words ? 'Off' : 'On'),
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  public populateErrorReport(errorObj: any): void {
    this.reportErrorMsg = `Any additional details?\n\n\n
    ***********************************
      PDF Error Report:

      PDF Upload Failed
    ***********************************
    `
    this.showReportError = true
  }

  /**
   * Prep report text and open feedback modal
   * @param doc
   */
  loadReportErrorModal(doc: DocumentSpark) {
    this.reportErrorMsg = `Any additional details?\n\n\n
    ***********************************
      PDF Error Report

      Document Title:
        ${doc.title}
      Document ID:
        ${doc.uuid}
      Request Time: 
        ${doc.requestedTime}
    ***********************************
    `
    this.showReportError = true
  }

  /**
   * Sorts the PNG and JSON files in the correct order. They come out of order from the PDF Upload Service
   * @param docs user media pdf documents
   */
  private sortPdfPages(docs: DocumentSpark[]): DocumentSpark[] {
    this.totalDocuments = docs.length
    docs.forEach(doc => {
      // if the pages are empty here, that means the image conversion failed or it is still converting
      if (!doc || (!doc.pages || doc.pages.length == 0)) return
      let pages = doc && doc.pages
      // if the user is not using OCR, this will be blank
      let json = (doc && doc.pdf.pages) || []
      // create a new array of objects comprised of page strings and page numbers (& JSON)
      const pageObjs = pages.map((page, i) => {
        return {
          p: page,
          n: page ? parseInt(page.split('-')[page.split('-').length - 1].split('.')[0]) : i,
        }
      })
      const jsonPageObjs = json.map((page, i) => {
        return {
          p: page,
          n: page ? parseInt(page.split('-')[page.split('-').length - 1].split('.')[0]) : i,
        }
      })
      // sort our array of page & JSON objects by the page number
      pageObjs.sort((a, b) => {
        if (a.n < b.n) {
          return -1
        }
        if (a.n > b.n) {
          return 1
        }
        return 0
      })
      jsonPageObjs.sort((a, b) => {
        if (a.n < b.n) {
          return -1
        }
        if (a.n > b.n) {
          return 1
        }
        return 0
      })
      // create a new array from the sorted pages & JSON files that is just an array of strings
      const sortedPages = pageObjs.map(page => {
        return page.p
      })
      const sortedJson = jsonPageObjs.map(page => {
        return page.p
      })
      // assign the sorted pages to the doc property
      doc.pages = sortedPages
      doc.pdf.pages = sortedJson
    })
    return docs
  }
}
