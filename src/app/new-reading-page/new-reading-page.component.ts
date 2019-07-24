import { ActivatedRoute, Router, Params } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { Angulartics2 } from 'angulartics2'
import { IMultiSelectOption, IMultiSelectSettings } from '../_directives'
import { take } from 'rxjs/operators'

import { AuthService, ProjectService, ReadingService, UtilToolService, AcademyService, MessageService } from '../_services'
import { EdjiComment, EdjiQuestion, User, Project, Reading } from '../shared/datatypes'
import { ReadingShareObject } from './../shared/nav-bar'
import * as Rangy from 'rangy'
import { Subscription, Observable, interval } from 'rxjs'

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
  public selectedReading: Reading

  // Trigger booleans
  public showAlert: boolean = false
  public showUploadModal: boolean = false
  public showFirstGroupModal: boolean = false
  public showConfirmArchiveModal: boolean = false
  public showHeroSubModal: boolean = false
  public showHeroParam: boolean = false
  public showReadingPreviewModal: boolean

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
  public guideContent: any[] = [
    {
      title: 'Use Formatting Styles',
      image: '/assets/guide/newReading__format.gif',
      body:
        'Select text in your Reading Content to use the formatting bar. Add bold, italic, or header styles to make your content pop!',
    },
    {
      title: 'Add Images and PDFs',
      image: '/assets/guide/newReading__insert.png',
      body:
        "PDFs and Images can be inserted into Readings, simply use the Insert bar on the left. Learn more in <a class='link' href='http://guide.edji.it/index.php/2017/05/09/customizing-your-lessons-with-edji-pdf-uploads/' target='_blank'>our PDF guide</a> and in <a class='link' href='http://guide.edji.it/index.php/2017/05/06/customizing-your-lessons-with-edji-images/' target='_blank'>our Image guide</a>.",
    },
    {
      title: 'Share your Reading',
      image: '/assets/guide/newReading__share.gif',
      body:
        "Click Share when finished and name your first Group to get a code&mdash;don't worry, you can create more Groups later!",
    },
  ]
  public guideStepNo: number = 1
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
    private _messages: MessageService
  ) {
    this.readingForm = fb.group({
      title: [null, Validators.required],
      source: [null, null],
      public: ['true'],
      subjects: [[], Validators.required],
      grade_levels: [[], Validators.required],
      instructions: [null, null],
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
    )

    this._title.setTitle('Edji | New Reading')
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    })
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
              instructions: this.reading.instructions,
            })
            this.versionId = this.reading.version_id
            if (this.reading.owner_id) {
              this.ownerId = this.reading.owner_id
            }

            this._title.setTitle('Edji | Editing: ' + this.reading.title)
          }
        },
        err => {
          // TRACK EXCEPTION
          console.error(err)
        },
      )
  }

  /**
   * Checks on the content field's cursor position
   * - Enables inserting images at cursor position
   */
  public contentChange(event: Event) {
    // Trigger autosave
    this.changeMonitor()
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
  private extractTextNodes(els: any, ancestorTags?: string[], ignoreText?: boolean) {
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
        this.words.push({
          str: '', // to be used for image title
          url: element.getAttribute('src'),
          styles: ['img'],
        })
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
        let nodeWords = element.textContent.split(/(?:([^a-zA-Z0-9]))/).filter(function (el) {
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
            styles: [].concat(inheritedTags),
          }
          let addBr = false
          if (index == 0 && wIndex == 0) {
            word.styles.push(tagName + '-a')
          }
          if (index == els.length - 1 && wIndex == nodeWords.length - 1) {
            word.styles.push(tagName + '-z')
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
  private formatReading(readingForm: any): Reading {
    // Create reading object to submit based on form object parameter
    let reading: Reading = Object.assign({}, readingForm)
    // Clear parsed words array
    this.words = []
    this.questions = []

    // Process reading html into useful Words Array
    let editors = this.el.nativeElement.querySelectorAll('#angularMediumEditor')
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
      this.saveState = 'saving'
    }
    // Prepare Reading object
    let reading = this.formatReading(form)

    this._readings.save(reading).subscribe(
      data => {
        if (data._id) {
          // Save for reference by Add Group modal and openFirstGroup()
          this.reading = data
          // Open new group if it is in final version
          if (reading.draft === false) {
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
            // Navigate user to newly created group for reading
            this.router.navigate(['project', this.newGroup._id], { queryParams: { readingCodeModal: true } })
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
   * @param referenceNode Element to insert after
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
  public addImages(images: { title: string; url: string }[]) {
    if (this.insertNode && this.insertNode.parentNode) {
      // If there is a reference node for cursor position, insert at cursor
      images.forEach(image => {
        let imgString = '<img src="' + image.url + '" title="' + image.title + '" />'
        this.insertAfter(this.insertNode.parentNode, imgString, this.insertNode)
        this.insertAfter(this.insertNode.parentNode, '<p>&#65279;</p>', this.insertNode)
      })
    } else {
      // If no reference node (field has not been interacted with) insert image at end
      let imgString = ''
      images.forEach(image => {
        imgString += '<img src="' + image.url + '" title="' + image.title + '" /><p>&#65279;</p>'
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
  public addQuestion(insertHtml?: string, insertEditorIndex?: number) {
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
      if (insertEditorIndex) {
        question.question_number = insertEditorIndex
        if (this.readingHtml.length > insertEditorIndex) {
          this.readingHtml.splice(insertEditorIndex, 0, { text: this.newReadingInner, question: question })
        } else {
          // Handle question added to end of reading
          this.readingHtml.push({ text: this.newReadingInner, question: question })
        }
      } else {
        this.readingHtml.push({ text: this.newReadingInner, question: question })
      }
    } else {
      question.question_number = insertEditorIndex
      if (this.readingHtml.length > insertEditorIndex) {
        this.readingHtml.splice(insertEditorIndex, 0, { text: insertHtml, question: question })
      } else {
        // Handle question added to end of reading
        this.readingHtml.push({ text: insertHtml, question: question })
      }
      this.updateQuestionNumbers()
    }
  }

  /**
   * Add a question to the "middle" of existing text and split it up
   */
  public addQuestionInLine() {
    if (this.insertNode && this.insertNode.parentNode) {
      // If there is a reference node for cursor position, insert at cursor
      // Get and clear all elements in the medium editor block after the cursor position
      let cutHtml = this.cutBlockContentsFromCaret()

      // Send the 'enter' key
      const event = new KeyboardEvent('keypress', {
        key: 'Enter',
      })
      document.dispatchEvent(event)

      // Create a new block and slice it in.. then add the stored text to that block
      let insertEditorIndex = 1
      let containingEditor = this.insertNode.parentNode ? this.insertNode.parentNode : this.insertNode

      for (let i = 0; i < 5; i++) {
        if (containingEditor.getAttribute('rindex')) {
          insertEditorIndex = parseInt(containingEditor.getAttribute('rindex')) + 1
          // Found containing editor
          i = 5
        } else {
          containingEditor = containingEditor.parentNode
        }
      }
      // Update model with modified HTML (isn't triggered programmatically)
      let precedingHtml = containingEditor.querySelector('.medium-editor-element').innerHTML
      this.readingHtml[insertEditorIndex - 1].text = precedingHtml
      /**
       * Make the html fragment a real piece of html!
       * - Closes any tags broken when "cut"
       */
      var div = document.createElement('div')
      div.appendChild(cutHtml.cloneNode(true))
      var html = div.innerHTML
      if (html.includes('angularMediumEditor') || html.includes('medium-editor-element')) {
        let newDiv = div.firstElementChild
        html = newDiv.innerHTML
      }

      this.addQuestion(html, insertEditorIndex)
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
        range.selectNodeContents(sel.focusNode.parentNode.parentNode)
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
  public deleteQuestion(questionNum: number) {
    // Append the text after the question to be deleted to the one before it
    this.readingHtml[questionNum - 1].text += this.readingHtml[questionNum].text

    // Remove the question
    this.readingHtml.splice(questionNum, 1)
    this.updateQuestionNumbers()
  }

  /**
   * Sets up the reading draft if it contains questions
   */
  private populateDraftContent(html) {
    let tmpArray = html.split('<$question$>')
    this.readingHtml[0].text = tmpArray[0]
    for (let i = 1; i < tmpArray.length; i++) {
      this.readingHtml.push({ text: tmpArray[i], question: this.reading.questions[i - 1] })
      this.readingHtml[i].question.new = true
      this.readingHtml[i].question.question_number = i
    }
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
    this.selectedReading = this.formatReading(form)
    // Check it reading is ready to Share
    if (this.validateReading(form)) {
      this.showReadingPreviewModal = true
    }
  }
}

export type AutosaveState = 'unsaved' | 'saving' | 'saved' | 'edited'