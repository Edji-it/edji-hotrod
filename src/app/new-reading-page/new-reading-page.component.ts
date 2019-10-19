import { ActivatedRoute, Router, Params } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { IMultiSelectOption, IMultiSelectSettings } from '../_directives'
import { take } from 'rxjs/operators'

import {
  AuthService,
  ProjectService,
  ReadingService,
  UtilToolService,
  AcademyService,
  MessageService,
  MediaService,
  SecretSwitchesService,
} from '../_services'
import { EdjiComment, EdjiQuestion, User, Project, Reading } from '../shared/datatypes'
import { ReadingShareObject } from './../shared/nav-bar'
import * as Rangy from 'rangy'
import { Subscription, Observable, interval } from 'rxjs'
import { Store } from '@ngrx/store'
import { AppState } from '../_reducers'
import { IncrementMetric } from '../_reducers/metrics.reducers'
import { DriverService } from '../_services/driver.service'

@Component({
  selector: 'new-reading-page',
  styleUrls: ['new-reading-page.component.scss'],
  templateUrl: './new-reading-page.component.pug',
})
export class NewReadingPage implements OnInit, OnDestroy {
  public readingForm: FormGroup
  // Initiating editors with blank contents prevents rapidly triggering do-check cycles
  // @todo (this is something that should really be fixed within the Medium Editor)
  public newReadingInner: string = ''
  public readingHtml: any[] = [{ text: this.newReadingInner }]
  public readingIsBlank: boolean = false
  public submitted: boolean = false
  public isDraft: boolean = true
  public saveState: AutosaveState = 'unsaved'
  public readingId: any = ''
  public reading: Reading = <Reading>{}
  public projects: any[] = []
  public questions: any[] = []
  public insertOptionShow: boolean
  public showPdfUploadModal: boolean
  private user: any
  private subscriptions: Subscription[] = []
  private readingType: string = 'newReading' // used for analytics purposes
  private autosaveTimer
  public previewReading: Reading

  // Trigger booleans
  public showAlert: boolean = false
  public showUploadModal: boolean = false
  public showFirstGroupModal: boolean = false
  public showConfirmArchiveModal: boolean = false
  public showHeroSubModal: boolean = false
  public showHeroParam: boolean = false
  public showReadingPreviewModal: boolean

  // Used to show large reading warning
  // APPROXIMATE VALUES not designed for user facing display
  public wordCount: number = 0
  public wordBoxCount: number = 0

  public errorObject = {
    readingError: '',
  }

  public successObject = {
    readingSuccess: '',
  }

  // Archiving state
  public readingToArchive: Reading
  public readingsArchivedBefore: string
  public readingArchivalSet: boolean = false
  // New project
  public newGroup: Project

  // Messages
  public successAlert: string = 'Nice work! This reading draft was successfully saved!'
  public readingPlaceholder: string = 'Type or paste your reading...'
  public error: string = '' // Error message
  public alert: string = ''

  public versionId: string = ''
  public ownerId: string
  public copyId: string = ''
  public editorToolbarY: number = 54
  public editorToolbarHidden: boolean
  public insertNode: any
  public masterSelection: any
  public currentUser: User // User data of the current user.

  public static readonly EDITOR_TOOLBAR_Y = 40

  // Used for processing reading
  public words: any[] = []
  public previousWordY: number = 0
  public imageDataCache: { url: string; data: { word_boxes: any } }[] = [] // Temporary store for image data, so we don't have to continuosly GET it

  // Configuration Options for Medium Editor
  public mediumEditorConfig: any = {
    imageDragging: false,
    paste: {
      forcePlainText: true,
      cleanPastedHTML: true,
      cleanAttrs: ['class', 'style', 'dir', 'id', 'target'],
      cleanTags: ['meta', 'button', 'input', 'form', 'label', 'pre', 'figure', 'hr', 'iframe'],
      unwrapTags: [
        'strong',
        'center',
        'sup',
        'sub',
        'span',
        'small',
        'div',
        'em',
        'footer',
        'ul',
        'ol',
        'li',
        'blockquote',
      ],
    },
    extensions: {
      // Disables Medium Editor handled image dragging
      imageDragging: {},
    },
    toolbar: {
      buttons: [
        'bold',
        'italic',
        'underline',
        'h1',
        'h2',
        'h3',
        {
          name: 'anchor',
          contentDefault: '&nbsp;',
        },
      ],
    },
  }

  // Tutorial variables
  public onboardTemplate: boolean
  //  IMultiSelectOption[]
  public subjects: any = [
    { id: 'literature', name: 'Language Arts' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'geography', name: 'Geography' },
    { id: 'history', name: 'History' },
    { id: 'government', name: 'Government' },
    { id: 'health', name: 'Health' },
    { id: 'languages', name: 'Foreign Languages' },
    { id: 'art', name: 'Art' },
    { id: 'computer', name: 'Computers/Technical' },
  ]
  //IMultiSelectSettings
  public subjectDropSettings: any = {
    displayAllSelectedText: true,
    dynamicTitleMaxItems: 4,
  }

  /**
   * TEMP: New feature flag (word highlights)
   */
  public newWordHighlights: boolean

  constructor(
    private _route: ActivatedRoute,
    private _readings: ReadingService,
    private router: Router,
    private angulartics: Angulartics2,
    fb: FormBuilder,
    private el: ElementRef,
    private _title: Title,
    private _auth: AuthService,
    private _academy: AcademyService,
    private _messages: MessageService,
    private _media: MediaService,
    private _switches: SecretSwitchesService,
    private store: Store<AppState>,
    private _driver: DriverService
  ) {
    this.readingForm = fb.group({
      title: [null, Validators.required],
      source: [null, null],
      public: ['true'],
      subjects: [[], Validators.required],
      grade_levels: [[], Validators.required],
      default_instructions: [null, null],
    })

    // Define the user object.
    this.currentUser = this._auth.getUser()
  } // constructor

  ngOnInit() {
    this.readingId = this._route.snapshot.params['id']
    this.copyId = this._route.snapshot.queryParams['copyId']
    this.alert = this._route.snapshot.queryParams['successAlert']
    // Set save state
    if (this.alert || this.readingId) {
      this.saveState = 'saved'
    }
    // if the user clicks Go Hero in the confirm archive modal, we need to make sure they save before continuing
    // the only way we can get the modal to show is watching the params because saving a draft triggers a reload
    if (this._route.snapshot.queryParams['showHeroParam']) {
      this.showHeroSubModal = true
    }
    // If loaded with guide param, show onboarding
    if (this._route.snapshot.queryParams['guide'] == 'welcome') {
      this.onboardTemplate = true
    }
    if (this.alert) {
      this.successObject.readingSuccess = this.alert
      this.showAlert = true
    }
    // Fetch the Reading if loading a draft that is not yet loaded
    if (this.readingId && (!this.reading || this.readingId !== this.reading._id)) {
      this.getReading(this.readingId)
    } else if (this.copyId) {
      // Fetch the Reading if copying from an existing Reading
      this.readingType = 'existingReading'
      this.getReading(this.copyId)
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'discover_reading_retrieve',
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }

    /** Set the current user every time it changes */
    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        // Gets the active readings from the dashboard if the user is not a hero user
        if (!this.user.hero_status && !this.readingArchivalSet) {
          this._readings.updateCreated(user)
        }
      }),
      this._readings.currentUserReadings.subscribe(
        data => {
          if (!data.readings) {
            // If no readings, nothing to handle
            return
          }
          // If we have readings, don't request created readings again
          this.readingArchivalSet = true
          if (!this.user.hero_status && data.readings[1] && !data.readings[1].archived) {
            // Take the second reading and make sure it is archived
            this.readingToArchive = data.readings[1]
            // reading that we'll be setting as our readingsArchivedBefore property on the user - send PUT to server
            this.readingsArchivedBefore = data.readings[0].createdAt
          } else {
            // Clear values
            delete this.readingToArchive
            delete this.readingsArchivedBefore
          }
        },
        error => {
          console.error(error)
        },
      ),
      this._switches.secretSwitchesUpdates.subscribe(switches => {
        if (switches['pdfWordHighlighting']) {
          this.newWordHighlights = switches['pdfWordHighlighting']
        }
      }),
    )

    this._title.setTitle('Edji | New Reading')
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    })
    // Remove rendered reading element (used in formatReading())
    let renderedEl = document.querySelector('#renderedReading')
    if (renderedEl && renderedEl.parentElement) {
      renderedEl.parentElement.removeChild(renderedEl)
    }
    // End tour
    this._driver.endTour()
  }

  /**
   * Begins Driver.js tour
   */
  beginTour() {
    // Start tour with steps for introduction
    this._driver.beginTour([
    {
      element: '#readingPageForm',
      popover: {
        className: 'first-step-editor-popover',
        title: 'Welcome to the New Reading page!',
        description: this.onboardTemplate ? `We've prefilled the editor with our "${this.reading.title}" lesson` : `We'll run you through the basics of building a reading`,
        position: 'top-center',
      }
    },
    {
      element: '[data-template="firstParagraph"]',
      popover: {
        title: `Look over the provided text`,
        description: 'Feel free to modify any of the content as you see fit!',
        position: 'top'
      }
    },
    {
      element: this.onboardTemplate ? '#question-1' : '#buttonInsertQuestion',
      popover: {
        title: `What will you ask?`,
        description: 'Questions are a great way to assess students without answers being shared with the class',
        position: 'top'
      }
    },
    {
      element: '#insertBar',
      popover: {
        title: 'Insert content, such as images!',
        description: 'The insert toolbar makes it easy to insert images, PDFs, and questions throughout your reading',
        position: 'top'
      }
    },
    {
      element: '#addReadingButton',
      popover: {
        title: `Press "Share" when your reading is ready`,
        position: 'bottom-right'
      }
    }
    ]);
  }

  /**
   * Auto-save after edits
   * - indicate that edits have been made and are unsaved
   * - save after timeout
   */
  changeMonitor(): void {
    this.saveState = 'edited'
    // Clear active timeout
    this.cancelAutosave()
    // Debounce user activity
    this.autosaveTimer = setTimeout(() => {
      this.autosave()
    }, 5000)
  }

  /**
   * Autosave the draft
   */
  private autosave(): void {
    if (this.validateReading(this.readingForm.value, true)) {
      this.saveReading(this.readingForm.value, true)
    } else {
      // Update save state: Unable to save
      this.saveState = 'unsaved'
    }
  }

  /**
   * Turns off the auto-save feature
   */
  private cancelAutosave(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer)
    }
  }

  private getReading(readingId: string) {
    this._readings
      .get(readingId)
      .pipe(take(1))
      .subscribe(
        (data: any) => {
          this.reading = data
          if (this.reading.html) {
            this.populateDraftContent(this.reading.html)
            this.readingForm.patchValue({
              title: this.reading.title,
              subjects: this.reading.subjects,
              grade_levels: this.reading.grade_levels,
              source: this.reading.source,
              public: this.reading.public ? this.reading.public.toString() : 'false',
              default_instructions: this.reading.default_instructions,
            })
            this.versionId = this.reading.version_id
            if (this.reading.owner_id) {
              this.ownerId = this.reading.owner_id
            }
            this._title.setTitle('Edji | Editing: ' + this.reading.title)
            // Ready for template tour
            setTimeout(()=> { // setTimeout ensures content has rendered
              if (this.onboardTemplate) {
                this.beginTour()
              }
            })
          }
        },
        err => {
          // TRACK EXCEPTION
          console.error(err)
        },
      )
  }

  /**
   * Handle content model change hooks
   * @param newContent 
   * @param readingPartIndex 
   */
  public contentModelChange(newContent, readingPartIndex) {
    // Trigger autosave
    this.changeMonitor()
    // Update model
    this.readingHtml[readingPartIndex].text = newContent
  }

  /**
   * Checks on the content field's cursor position
   * - Enables inserting images at cursor position
   */
  public selectionInteraction(event?: Event) {
    // Handle insert position
    if (!Rangy) {
      // Clicking the editor before page is finished loading causes a broken reference to Rangy
      return
    }
    let sel = Rangy.getSelection()
    this.masterSelection = sel

    if (sel.focusNode) {
      let focusNode = sel.focusNode

      if (
        focusNode &&
        focusNode.getAttribute &&
        focusNode.id == 'angularMediumEditor' &&
        focusNode.querySelector('img')
      ) {
        // If focus is generically on medium editor, it's often caused by cursor inline with a single image, so if there is an image, focus that
        focusNode = focusNode.querySelector('img')
      } else if (focusNode && focusNode.getAttribute && focusNode.id == 'angularMediumEditor') {
        // Otherwise, set focus to the inside of the start of the editor
        focusNode = focusNode.childNodes[0]
      }

      if (focusNode) {
        this.editorToolbarHidden = true
        let editors = document.querySelectorAll('medium-editor')
        let editorOffset = this.getNodeY(editors[0]) - NewReadingPage.EDITOR_TOOLBAR_Y
        let insertNodeY
        for (let i = 0; i < editors.length; i++) {
          if (editors[i] && editors[i].contains(focusNode)) {
            this.editorToolbarHidden = false
          }
        }
        if (focusNode && focusNode.className && focusNode.className.indexOf('medium-editor-element') > -1) {
          focusNode = focusNode.childNodes[0]
        }
        this.insertNode = focusNode
        insertNodeY = this.getNodeY(this.insertNode) - editorOffset
        this.editorToolbarY =
          NewReadingPage.EDITOR_TOOLBAR_Y > insertNodeY ? NewReadingPage.EDITOR_TOOLBAR_Y : insertNodeY
      } else {
        // don't move bar
      }
    } else {
      this.editorToolbarHidden = true
    }
  }

  /**
   * Returns appropriate placeholder text based on ReadingHtml array index
   */
  public getReadingPlaceholder(textIndex: number): string {
    if (textIndex == 0) {
      return this.readingPlaceholder
    } else {
      return ' '
    }
  }

  /**
   * Returns Element Y Value
   * @argument node: any Html Element or Text node
   */
  private getNodeY(node: any) {
    // This function is called against element selectors, which are prone to returning nothing/undefined
    if (typeof node == 'undefined') {
      node = {}
    }
    if (node.nodeType === 3) {
      let range = document.createRange()
      range.selectNodeContents(node)
      var rects = range.getClientRects()
      if (rects[0]) {
        return rects[0].top + window.scrollY
      } else {
        return null
      }
    } else {
      return node.getBoundingClientRect ? node.getBoundingClientRect().top + window.scrollY : null
    }
  }

  /**
   * Clean out Grammarly styles from HTML
   */
  private cleanGrammarly(element: any) {
    // select element to unwrap
    let els = element.querySelectorAll('g')
    for (let i = 0; i < els.length; i++) {
      let el = els[i]
      let parent = el.parentNode
      // move all children out of the element
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      // remove the empty element
      parent.removeChild(el)
    }
  }

  /**
   * Loops through child elements to find textnodes
   * Pushes text nodes as formatted objects into this.words
   * @param element Root element to start crawling from
   */
  private async extractTextNodes(els: any, ancestorTags?: string[], ignoreText?: boolean) {
    // This functional can except an array for nodes or a singular node
    // If singular, pop into an array
    if (!els) {
      els = []
    } else if (!els[0]) {
      els = [els]
    }

    for (let index = 0; index < els.length; index++) {
      let element = els[index]
      let tagName = 'tagName' in element && element.tagName.toLowerCase()
      // Children should inherit tags from several elements up
      // eg. "B" style should propagate down
      if (!ancestorTags) {
        ancestorTags = []
      }
      let inheritedTags = ancestorTags.slice()
      // let nodes = element.childNodes
      // Detect line breaks
      let currentTop = this.getNodeY(element) ? this.getNodeY(element) : this.previousWordY
      if (currentTop - this.previousWordY > 10 && this.previousWordY != 0) {
        this.words.push({
          str: '',
          styles: ['br'],
        })
      }
      this.previousWordY = currentTop

      if (inheritedTags.indexOf(tagName) < 0 && tagName) {
        inheritedTags.push(tagName)
      }

      if (tagName === 'img') {
        let imgUrl = element.getAttribute('src')
        let imgWordObj = {
          str: '', // to be used for image title
          url: imgUrl,
          styles: [],
        }
        // Use "img" styles to indicate an image tag
        imgWordObj.styles.push('img')
        /**
         * Processing for including OCR data
         */
        let imgDataUrl = element.getAttribute('edji-data-src')
        if (imgDataUrl) {
          let imgData
          // Determine if we have OCR JSON data for image already
          imgData = this.imageDataCache.find(data => {
            return data.url === imgDataUrl
          })
          // Try to get the json data for pdf (if legacy file or user skips OCR, this will be undefined)
          if (!imgData || !imgData.data) {
            imgData = { url: imgDataUrl }
            imgData.data = await this._media.getDocumentData(imgDataUrl).toPromise()
            // Store image data locally so we don't need to GET on each save
            this.imageDataCache.push(imgData)
          }
          // Attach word "boxes" to the word
          if (imgData && imgData.data && imgData.data.word_boxes) {
            imgWordObj['boxes'] = imgData.data.word_boxes
            this.wordBoxCount += imgWordObj['boxes'].length
          }
        }
        this.words.push(imgWordObj)
      }

      if (tagName === 'a' && !ignoreText) {
        let aStyles = ['a'].concat(inheritedTags)
        let aWord = {
          str: element.innerText,
        }
        aWord['styles'] = aStyles
        if (element.getAttribute('href')) {
          aWord['url'] = element.getAttribute('href')
        }
        this.words.push(aWord)
        // Process any nested elements, except text since that was already saved to link
        this.extractTextNodes(element.childNodes, inheritedTags, true)
      } else if (element.nodeType === 3 && !ignoreText) {
        // Found a text node!
        // Make sure we aren't processing line breaks within the text nodes
        // Text nodes should rely on word wrap
        let rootWordTags = inheritedTags.slice()
        rootWordTags.indexOf('br') > -1 && rootWordTags.splice(rootWordTags.indexOf('br'), 1)
        // Split text inside child nodes
        let nodeWords = element.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function(el) {
          return el.replace(/([\n])/g, '')
        })
        // If empty element, push a spacer word to reflect that
        if (nodeWords.length < 1) {
          this.words.push({
            str: '',
            styles: ['space', 'space-first', 'space-last'].concat(inheritedTags),
          })
        }

        // Otherwise loop through words, and process into array
        for (let wIndex = 0; wIndex < nodeWords.length; wIndex++) {
          let nodeWord = nodeWords[wIndex]
          let word = {
            str: nodeWord,
            styles: [],
          }
          // Set inherited tags
          word.styles = word.styles.concat(inheritedTags)
          let addBr = false
          if (tagName) {
            if (index == 0 && wIndex == 0) {
              word.styles.push(tagName + '-a')
            }
            if (index == els.length - 1 && wIndex == nodeWords.length - 1) {
              word.styles.push(tagName + '-z')
            }
          }
          if (typeof word.str == 'string' && word.str.trim().length < 1) {
            // As a space saving technique, we save spaces as empty object
            this.words.push({})
          } else {
            // Don't save the useless "div" style
            let i = word.styles.indexOf('div')
            if (i > -1) {
              word.styles.splice(i, 1)
            }
            // Don't save empty word strings
            if (word.str == '') {
              delete word.str
            }
            // Don't save empty styles arrays
            if (word.styles == []) {
              delete word.styles
            }
            this.words.push(word)
          }
        }
      } else {
        this.extractTextNodes(element.childNodes, inheritedTags, ignoreText)
      }
    }
  }

  /**
   * Custom form validation for a New Reading
   * @param form Reading form
   */
  private validateReading(form: any, autosave?: boolean): boolean {
    let questionsValid: boolean = true
    // Set submitted to show form errors
    if (!autosave) {
      this.submitted = true
      this.error = ''
    }
    // Custom empty validation for reading content
    if (
      this.el.nativeElement.querySelector('medium-editor').innerText.trim().length > 0 ||
      this.el.nativeElement.querySelectorAll('medium-editor img').length > 0
    ) {
      this.readingIsBlank = false
    } else {
      this.readingIsBlank = true
    }
    // Overall validation check that questions have been filled out properly
    if (this.readingHtml[1] && this.readingHtml[1].question) {
      for (let i = 0; i < this.readingHtml.length; i++) {
        if (
          this.readingHtml[i].question &&
          (!this.readingHtml[i].question.prompt ||
            this.readingHtml[i].question.prompt === '' ||
            (this.readingHtml[i].question.answer_types && this.readingHtml[i].question.answer_types.length < 1))
        ) {
          questionsValid = false
        } else {
          // Content is not blank if it includes a question!
          this.readingIsBlank = false
        }
      }
    }

    if (
      !form.title ||
      form.title.length < 1 ||
      this.readingIsBlank ||
      !questionsValid ||
      (form.public == 'true' && (form.grade_levels.length < 1 || form.subjects.length < 1))
    ) {
      return false
    } else {
      return true
    }
  }

  public saveReading(form, autosave?: boolean): boolean {
    // Save draft!
    this.isDraft = true
    return this.onSubmit(form, autosave)
  }

  /**
   * Verifies the user can save this reading without having to push one in to the archives
   * @param form the new reading form data
   */
  public verifyCanShare(form) {
    // Need to dismiss the reading preview modal and then we can show the new group modal
    this.showReadingPreviewModal = false
    // Check it reading is ready to Share
    if (this.validateReading(form)) {
      // turn off the auto-save feature and clear any auto-save messages
      this.cancelAutosave()
      this._messages.dismissToast('reading_autosave')
      // "Auto-save" for the user
      this.saveReading(form, true)
      if (!this.user.hero_status && this.readingToArchive) {
        // if user is not a hero, we'll show them a confirmation modal
        // confirmation modal will warn the user that this new reading
        // will push an existing active reading to archives. they also
        // have the option to save as draft instead
        this.showConfirmArchiveModal = true
      } else {
        // if user is a hero, they can go ahead and share the reading
        // share reading modal will pop up to fill in group details and confirm
        this.showFirstGroupModal = true
      }
    }
  }

  public shareReading(form) {
    // No longer draft!
    this.isDraft = false
    this.onSubmit(form)
  }

  /**
   * Update user's archived date
   * @param reading the reading that is to be archived (is an active reading on the created dashboard)
   * @param form is the new reading we're going to share once we finish archiving the older active reading
   */
  public async archiveReading(): Promise<void> {
    // Make the call to PUT the reading archive value
    let user = this.user
    user.archive_readings_before = this.readingsArchivedBefore
    try {
      this._auth.updateUser(user).toPromise()
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Interprets reading html and decorates reading properties
   * @param readingForm "raw" reading from form fields
   */
  public formatReading(readingForm: any): Reading {
    // Create reading object to submit based on form object parameter
    let reading: Reading = Object.assign({}, readingForm)
    // Clear parsed words array
    this.words = []
    this.questions = []
    // Clear stat values
    this.wordCount = 0
    this.wordBoxCount = 0

    // Process reading html into useful Words Array
    let editors: any = document.querySelectorAll('#readingPageForm #angularMediumEditor')
    let concatHtml = ''
    // Loop through Medium-Editor elements, and get child elements???

    for (let i = 0; i < editors.length; i++) {
      let contentEl = editors[i]
      // Make sure we aren't copying parts of the medium-editor
      while (
        contentEl.childNodes.length == 1 &&
        contentEl.firstChild.classList &&
        contentEl.firstChild.classList.contains('medium-editor-element')
      ) {
        contentEl = contentEl.firstChild
      }
      // Add question "word"
      if (this.readingHtml[i].question) {
        // Concatenate the
        concatHtml += '<$question$>'
        this.words.push({
          styles: ['question'],
          index: i - 1,
        })
      }

      // Add question to questions
      if (this.readingHtml[i].question) {
        this.questions.push(this.readingHtml[i].question)
      }

      // Concatenate the html to 1 string [not currently using with current config]
      concatHtml += contentEl.innerHTML
      if (!document.querySelector('#renderedReading')) {
        let div1 = document.createElement('div')
        div1.setAttribute('id', 'renderedReading')
        div1.style.width = '100000px'
        div1.style.position = 'absolute'
        div1.style.top = '100%'
        div1.style.left = '100%'
        div1.className = 'content'
        document.body.appendChild(div1)
      }
      let rendered: any = document.querySelector('#renderedReading')
      let renderHtml
      // rendered['innerHTML'] = this.readingHtml[i].text
      rendered['innerHTML'] = contentEl.innerHTML
      renderHtml = document.querySelector('#renderedReading')

      // Reset line break detection
      this.previousWordY = 0
      // // Clean renderHtml
      this.cleanGrammarly(renderHtml)
      // Loop through all Reading html elements
      this.extractTextNodes(renderHtml)
    }
    // Track current word count (divide by two to roughly remove spaces)
    this.wordCount = (this.words.length + 1) / 2

    delete reading['label']
    // reading.html = this.readingHtml
    reading.html = concatHtml
    reading.words = this.words
    reading.questions = this.questions

    // If the reading is not being saved as a draft (A.K.A. it's a final version)
    if (this.isDraft === true) {
      reading.draft = true
      /**
       * Updated "createdAt" date to reflect when it became a true reading
       * - WORKAROUND: We use createdAt to sort the dashboard, and this avoids issues with recently shared readings showing later
       */
      reading.createdAt = new Date().toISOString()
    } else {
      reading.draft = false
    }
    if (this.readingId !== '') {
      reading._id = this.readingId
    }
    if (this.versionId) {
      reading.version_id = this.versionId
    }
    if (this.ownerId) {
      reading.owner_id = this.ownerId
    }
    // Set "parent_id" for new copies/versions
    if (this.copyId) {
      // Use OG "parent_id" (indicates the first version)
      reading.parent_id = this.reading.parent_id ? this.reading.parent_id : this.copyId
    }

    return reading
  }

  /**
   * Runs on form submit, and processes reading before calling service
   *  @param form Passed from the HTML form element
   *  @returns boolean False if error saving or validating
   */
  private onSubmit(form, autosave?: boolean): boolean {
    // This would be better handled by formcontrols
    if (this.validateReading(form) === false) {
      this.error = ':warning: <b>Empty Fields</b> Not quite, please make sure all highlighted fields are complete!'
      return false
    } else {
      // Update save state: Attempting to save
      this.errorObject = { readingError: '' }
      this.saveState = 'saving'
    }
    // Prepare Reading object (and save for reference by Add Group modal and openFirstGroup())
    this.reading = this.formatReading(form)

    this._readings.save(this.reading).subscribe(
      data => {
        if (data._id) {
          // Save for reference by Add Group modal and openFirstGroup()
          this.reading = data
          // Open new group if it is in final version
          if (this.reading.draft === false) {
            // fire an analytic event here for tracking purposes
            this.angulartics.eventTrack.next({
              action: this.readingType + '_' + (this.reading.public ? 'public' : 'private') + '_create',
              properties: {
                category: this._auth.setAnalyticEventCategory(),
                label: this._auth.setAnalyticEventLabel(),
              },
            })
            // Send the data to Pipo to log the new reading
            this._academy.pipoEvent({
              // standard event info:
              event_name: 'reading_created',
              user_id: this.user._id,
              teacher: this.newGroup.teacher_id === this.user._id,
              hero: this.user.hero_status || false,
              institution_id: this.user.institution_ids || [],
              // event-specific info:
              reading_id: this.reading._id,
              group_id: this.newGroup._id,
              subjects: this.reading.subjects,
              source: this.reading.source,
            })
            // Track reading creation count
            this.store.dispatch(new IncrementMetric('readings_created'))
            // Navigate user to newly created group for reading
            let redirectParams = { readingCodeModal: true }
            if (this.onboardTemplate) {
              redirectParams['guide'] = 'welcome'
            }
            this.router.navigate(['project', this.newGroup._id], { queryParams: redirectParams })
          } else {
            if (!autosave) {
              this.successObject.readingSuccess = this.successAlert
              this.showAlert = true
              // fire an analytic event here for tracking purposes
              this.angulartics.eventTrack.next({
                action: this.readingType + '_draft_save',
                properties: {
                  category: this._auth.setAnalyticEventCategory(),
                  label: this._auth.setAnalyticEventLabel(),
                },
              })
              // Update URL with reading id, now that we have one
              if (this.showHeroParam) {
                this.router.navigate(['new-reading/' + data._id], {
                  queryParams: { successAlert: this.successAlert, showHeroParam: this.showHeroParam },
                })
              } else {
                this.router.navigate(['new-reading/' + data._id], { queryParams: { successAlert: this.successAlert } })
              }
            }
            // Update reading values for continuing to edit
            this.readingId = data._id
            this.reading.updatedAt = data.updatedAt
            // Update save state: Successfully saved
            setTimeout(() => {
              // We save readings fast! Give the user a split second to realize something is happening
              this.saveState = 'saved'
            }, 500)
          }
          return true
        }
      },
      error => {
        console.error(error)
        this.errorObject.readingError = 'There was an issue saving your reading. It may be our fault; please try again'
        return false
      },
    )
  }

  /**
   * Opens reading for first group
   * @param project Project object for first group
   */
  public finalizeShare(readingForm: any, project: Project) {
    // Set newly created Group
    this.newGroup = project
    // Archive if needed
    if (this.readingsArchivedBefore) {
      this.archiveReading()
      this.shareReading(readingForm)
    } else {
      this.shareReading(readingForm)
    }
  }

  /**
   * Takes an html string, and inserts it after a given element
   * @param parent Parent element of referenceNode
   * @param htmlString String of html content
   * @param referenceNode Element to insert before
   */
  private insertAfter(parent: Element, htmlString: string, referenceNode: Element) {
    // Create elements from html string
    let template = document.createElement('template')
    template.innerHTML = htmlString
    // Insert elements after referenceNode
    parent.insertBefore(template.content.firstChild, referenceNode.nextSibling)
    this.insertNode = referenceNode.nextSibling
  }

  /**
   * Takes an array of objects with a title and a url for an Image, formats, then inserts into reading
   * @param images Array of image objects to be inserted
   */
  public addImages(images: { title: string; url: string; data?: string }[]) {
    // conveninent image tag builder
    function buildImageTag(image: { url?: string; title?: string; data?: string }): string {
      if (image.data) {
        return '<img src="' + image.url + '" title="' + image.title + '" edji-data-src="' + image.data + '" />'
      } else {
        return '<img src="' + image.url + '" title="' + image.title + '" />'
      }
    }

    if (this.insertNode && this.insertNode.parentNode) {
      let spacerId = 'spacer' + (new Date).getTime()
      // If there is a reference node for cursor position, insert at cursor
      images.forEach((image, index) => {
        let imgString = buildImageTag(image)
        this.insertAfter(this.insertNode.parentNode, imgString, this.insertNode)
        this.insertAfter(this.insertNode.parentNode, `<p data-editor="${spacerId + '-' + index}">&#65279;</p>`, this.insertNode)
      })
      // Manually update model where DOM is being manipulated
      let { editor, index } = this.getContainingEditor(this.insertNode)

      if (editor && index >= 0) {
        // Update model
        this.readingHtml[index].text = editor.querySelector('.medium-editor-element').innerHTML
        setTimeout(()=> {
          // Use last spacer element as insert node
          let spacer = document.querySelector(`[data-editor="${spacerId + '-' + (images.length - 1)}"]`)
          let spacerContents = spacer.firstChild || spacer
          this.updateNodeAfterInsert(spacerContents)
        })
      }
    } else {
      // If no reference node (field has not been interacted with) insert image at end
      let imgString = ''
      images.forEach(image => {
        imgString += buildImageTag(image) + '<p>&#65279;</p>'
      })
      this.readingHtml[this.readingHtml.length - 1].text += imgString
    }
  }

  public updateQ(question, freshQuestion) {
    /* Whenever updates happen to the question component like..
     *  adding an answer type
     *  removing an answer type
     *  ..then we will update the question array object here
     */
    question = freshQuestion
  }

  /**
   * Adds a question block to the new reading and then adds in a new medium editor
   */
  public addQuestion(insertHtml?: string, newEditorIndex?: number) {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: 'qna_question_added',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    let answer_types = this._auth.getAllowedCommentMediaTypes()
    let question = <EdjiQuestion>{
      prompt: '',
      answer_types: answer_types,
      option_types: [],
      new: true,
      question_number: this.readingHtml.length,
    }

    // insertHtml is optional, and may not be defined
    if (typeof insertHtml == 'undefined') {
      insertHtml = ''
    }

    if (insertHtml.includes('angularMediumEditor')) {
      if (newEditorIndex) {
        question.question_number = newEditorIndex
        if (this.readingHtml.length > newEditorIndex) {
          this.readingHtml.splice(newEditorIndex, 0, { text: this.newReadingInner, question: question })
        } else {
          // Handle question added to end of reading
          this.readingHtml.push({ text: this.newReadingInner, question: question })
        }
      } else {
        this.readingHtml.push({ text: this.newReadingInner, question: question })
      }
    } else {
      question.question_number = newEditorIndex
      if (this.readingHtml.length > newEditorIndex) {
        this.readingHtml.splice(newEditorIndex, 0, { text: insertHtml, question: question })
      } else {
        // Handle question added to end of reading
        this.readingHtml.push({ text: insertHtml, question: question })
      }
      this.updateQuestionNumbers()
    }

    // Set insert node so user can add multiple questions at once
    if (newEditorIndex) {
      setTimeout(() => {
        this.updateNodeAfterInsert(
          document.querySelector('medium-editor[rindex="'+newEditorIndex+'"] div'), 
          newEditorIndex
        )
      })
    }
  }

  /**
   * Updates "insertNode" after inserting
   * - Allows user to repeatedly insert elements
   */
  public updateNodeAfterInsert(newNode, newEditorIndexFocus?: number) {
    this.insertNode = newNode
    if (newNode) {
      // Update insert toolbar position
      if (this.insertNode.focus) {
        // If focusable element, such as editor itself, simply focus
        this.insertNode.focus()
      } else {
        // If node within editor, make selection around contents
        const selection = Rangy.getSelection()
        const range = Rangy.createRange()
        range.selectNodeContents(this.insertNode)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      this.selectionInteraction()
      if (newEditorIndexFocus) {
        let question = document.querySelector('edji-question[rindex="'+newEditorIndexFocus+'"]')
        let questionY = this.getNodeY(question)- NewReadingPage.EDITOR_TOOLBAR_Y
        window.scrollTo(0, questionY)
      }
    } 
  }

  /**
   * Get parent editor reference
   * @returns containing editor and its index (if found)
   */
  public getContainingEditor(node: HTMLScriptElement): { editor: HTMLScriptElement, index: number } {
    let editor 
    let index
    while (!index) {
      // We don't want to modify the node value passed in
      let nodeRef = editor ? editor : node
      if (nodeRef.getAttribute && nodeRef.getAttribute('rindex')) {
        index = parseInt(nodeRef.getAttribute('rindex'))
        editor = nodeRef
        // Found containing editor
        break
      } else if (nodeRef.parentNode) {
        editor = <HTMLScriptElement>nodeRef.parentNode
      } else if (nodeRef.closest && nodeRef.closest('medium-editor')) {
        // Covers case where element in contenteditable is "detached" from DOM
        console.error('New Reading: Used "closest" to insert (null parentNode)')
        editor = <HTMLScriptElement>nodeRef.closest('medium-editor')
      } else {
        // Fall back to adding question at the end
        console.error('New Reading: Failed inline insert (no parentNode or closest)')
        break
      }
    }
    return { editor, index }
  }

  /**
   * Add a question to the "middle" of existing text and split it up
   */
  public addQuestionInLine() {
    if (this.insertNode && this.insertNode.parentNode) {
      let { editor, index } = this.getContainingEditor(this.insertNode)
      if (index >= 0) {
        let newEditorIndex = index + 1
        // If there is a reference node for cursor position, insert at cursor
        // Get and clear all elements in the medium editor block after the cursor position
        let cutHtml = this.cutBlockContentsFromCaret()
        // Send the 'enter' key
        const event = new KeyboardEvent('keypress', {
          key: 'Enter',
        })
        document.dispatchEvent(event)
        // Update model with modified HTML (isn't triggered programmatically)
        let precedingHtml = editor.querySelector('.medium-editor-element').innerHTML
        this.readingHtml[index].text = precedingHtml
        /**
         * Make the html fragment a real piece of html!
         * - Closes any tags broken when "cut"
         */
        var div = document.createElement('div')
        div.appendChild(cutHtml.cloneNode(true))
        var html = div.innerHTML
        this.addQuestion(html, newEditorIndex)
      } else {
        this.addQuestion()
      }
    } else {
      // If no reference node (field has not been interacted with) insert question at end
      this.addQuestion()
    }
  }

  /**
   * Extracts all elements in the medium editor after the cursor
   */
  private cutBlockContentsFromCaret(): any {
    var sel = Rangy.getSelection()
    if (sel.rangeCount) {
      var selRange = sel.getRangeAt(0)
      var blockEl = this.getBlockContainer(selRange.endContainer)
      if (blockEl) {
        var range = selRange.cloneRange()
        var containingNode = sel.focusNode
        // Locate containing medium-editor-element/contenteditable
        while (containingNode && (!containingNode.classList || !containingNode.classList.contains('medium-editor-element'))) {
          if (containingNode.parentNode) {
            containingNode = containingNode.parentNode
          } else {
            break
          }
        }
        range.selectNodeContents(containingNode)
        range.setStart(selRange.endContainer, selRange.endOffset)
        return range.extractContents()
      }
    }
  }

  /**
   * Gets the block container for the element extractor
   */
  private getBlockContainer(node) {
    while (node) {
      // Example block elements below, you may want to add more
      //&& /^(P|H[1-6]|DIV)$/i.test(node.nodeName)
      if (node.nodeType == 1) {
        return node
      }
      node = node.parentNode
    }
  }

  /**
   * Removes a question block to the new reading and then adds in a new medium editor
   */
  public deleteQuestion(htmlIndex: number) {
    // Append the text after the question to be deleted to the one before it
    this.readingHtml[htmlIndex - 1].text += this.readingHtml[htmlIndex].text
    // Remove the question
    this.readingHtml.splice(htmlIndex, 1)
    this.updateQuestionNumbers()
    // Update selection/insert toolbar
    this.selectionInteraction()
  }

  /**
   * Sets up the reading draft if it contains questions
   */
  private populateDraftContent(html) {
    let tmpArray = html.split('<$question$>')
    this.readingHtml[0].text = tmpArray[0]
    for (let i = 1; i < tmpArray.length; i++) {
      this.readingHtml.push({ text: tmpArray[i], question: this.reading.questions[i - 1] })
      this.readingHtml[i].question.question_number = i
    }
    setTimeout(() => {
      // Trigger formatReading to fetch image data and check word counts
      this.formatReading(this.reading.html)
    })
  }

  /**
   * Sets up the reading draft if it contains questions
   */
  private updateQuestionNumbers() {
    for (let i = 1; i < this.readingHtml.length; i++) {
      this.readingHtml[i].question.question_number = i
    }
  }

  public openReadingPreview(form: any): void {
    this.previewReading = this.formatReading(form)
    // Check it reading is ready to Share
    if (this.validateReading(form)) {
      this.showReadingPreviewModal = true
    }
  }

  /**
   * Calculates if reading is potentially too heavy
   */
  public isLargeReading(wordCount, wordBoxCount) {
    return wordCount + wordBoxCount > 3000
  }
}

export type AutosaveState = 'unsaved' | 'saving' | 'saved' | 'edited'
