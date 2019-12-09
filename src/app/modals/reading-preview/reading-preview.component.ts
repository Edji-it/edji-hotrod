import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core'
import { Router } from '@angular/router'

// Project Dependencies
import { Reading, User } from 'src/app/shared/datatypes'
import { ReadingService, AuthService, AnalyticsService } from 'src/app/_services'

@Component({
  selector: 'hot-reading-preview-modal',
  templateUrl: 'reading-preview.component.pug',
  styleUrls: ['./reading-preview.component.scss'],
})
export class ReadingPreviewModal implements AfterViewInit, OnInit {
  @Input() reading: Reading
  @Input() user: User
  @Input() context: string = 'created' // 'created' for readings based on already created || 'creator' for brand new readings
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() createSuccess: EventEmitter<Reading> = new EventEmitter()

  // state values
  public initialized: boolean
  public loading: boolean = true
  public loggedIn: boolean = true
  public showLoginModal: boolean
  public showReadingLinkModal: boolean

  public copy: {
    share: string
    edit: string
    send: string
    actionTitle: string
  } = {
    share: 'Use',
    edit: 'Edit',
    send: 'Send Link',
    actionTitle: 'Use this Reading',
  }

  constructor(
    private _router: Router,
    private _readings: ReadingService,
    private _auth: AuthService,
    private _analytics: AnalyticsService,
  ) {}

  async ngOnInit() {
    switch (this.context) {
      case 'creator':
        this.copy.actionTitle = 'Ready to share?'
        this.copy.share = 'Share'
        this.copy.edit = 'Keep Editing'
        // do not display Send Link while editing
        this.copy.send = ''
        break
      case 'created':
        if (!this.user || !this.user.isLoggedIn) {
          this.loggedIn = false
          this.copy.actionTitle = 'Want this reading?'
        }
        try {
          // The Discover Feed only has the first 100 words, so we need to make a call to get the full reading to attach all words
          let fullReading: Reading
          fullReading = await this._readings.get(this.reading._id).toPromise()
          // add missing properties to the reading
          this.reading.words = fullReading.words
          this.reading.questions = fullReading.questions
          this.reading.html = fullReading.html
          if (this.reading.questions) {
            this.updateQuestionNumbers(this.reading.questions)
          }
          this.loading = false
        } catch (err) {
          console.error(err)
        }
        break
      default:
    }
    // Workaround: This modal is long enough that it needs to scroll and we don't want two scrollbars
    document.body.style.overflow = 'hidden'
  }

  ngAfterViewInit() {
    // Need to give the modal time to load before allowing the clickOutside binding to close the modal
    setTimeout(() => {
      this.initialized = true
    }, 1)
  }

  /**
   * Sends user to the New Reading page with the copyId query param
   */
  public copyReading(): void {
    this.close()
    // since reading preview can be called from the new reading page, let's make sure we don't just send them back here with a blank form
    if (this.context === 'created') {
      this._router.navigate(['/new-reading'], { queryParams: { copyId: this.reading._id } })
    }
  }

  /**
   * Returns whether a "w" word contains a style class
   * @param w Word object
   */
  public wHasStyle(w, style): boolean {
    return w && w.styles && w.styles.indexOf(style) > -1
  }

  /**
   * close the modal only if template has initialized
   */
  public close(login?: boolean): void {
    if (this.initialized) {
      this.closeModal.emit(login)
    }
    // Workaround: Clear scrollbar hiding
    document.body.style.overflow = ''
  }

  // Adds the question number to each question for proper rendering
  private updateQuestionNumbers(questions) {
    for (let i = 0; i < questions.length; i++) {
      questions[i].question_number = i + 1
    }
  }

  /**
   * Bypass the new reading page and just create the new reading altogether
   */
  public async createReading(): Promise<void> {
    // since reading preview can be called from the new reading page, let's make sure we save this properly
    if (this.context === 'created') {
      let saveReading: Reading = Object.assign({}, this.reading)
      // Set parent id to reading copied from
      saveReading.parent_id = this.reading._id
      // remove _id, and other owner properties before we save
      delete saveReading._id
      delete saveReading.owner_id
      delete saveReading['owner']
      delete saveReading['words_preview']
      delete saveReading.createdAt
      delete saveReading.updatedAt
      if (this.reading.owner_id !== this.user._id) {
        delete saveReading.version_id
      }
      try {
        let savedReading: Reading
        savedReading = await this._readings.save(saveReading).toPromise()
        this._analytics.event(`existingReading_${this.reading.reading_type == 'public' ? 'public' : 'private'}_create`)
        this.createSuccess.emit(savedReading)
        // Workaround: Clear scrollbar hiding
        document.body.style.overflow = ''
      } catch (err) {
        console.error(err)
      }
    } else {
      this.createSuccess.emit(this.reading)
    }
  }
}
