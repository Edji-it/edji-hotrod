import { Component, Input, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { Reading, Project, User } from 'src/app/shared/datatypes'
import { ReadingService, AcademyService, AuthService } from 'src/app/_services'

@Component({
  selector: 'hot-reading-preview-modal',
  templateUrl: 'reading-preview.component.pug',
  styleUrls: ['./reading-preview.component.scss']
})
export class ReadingPreviewModal implements AfterViewInit, OnInit {
  @Input() reading: Reading
  @Input() user: User
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  // state values
  public initialized: boolean
  public showFirstGroupModal: boolean

  // Archiving state
  public readingToArchive: Reading
  public readingsArchivedBefore: string
  public readingArchivalSet: boolean = false

  public newGroup: Project

  constructor(
    private _router: Router,
    private _readings: ReadingService,
    private _academy: AcademyService,
    private angulartics: Angulartics2,
    private _auth: AuthService
  ) {}

  async ngOnInit() {
    // The Discover Feed only has the first 100 words, so we need to make a call to get the full reading to attach all words
    try {
      let fullReading: Reading
      fullReading = await this._readings.get(this.reading._id).toPromise()
      // add missing properties to the reading
      this.reading.words = fullReading.words
      this.reading.questions = fullReading.questions
      this.reading.html = fullReading.html
      if (this.reading.questions) {
        this.updateQuestionNumbers(this.reading.questions)
      }
    } catch (err) {
      console.error(err)
    }

    try {
      let userReadings = await this._readings.currentUserReadings.toPromise()

      if (!userReadings.readings) {
        // If no readings, nothing to handle
        return
      }

      // If we have readings, don't request created readings again
      this.readingArchivalSet = true
      if (!this.user.hero_status && userReadings.readings[1] && !userReadings.readings[1].archived) {
        // Take the second reading and make sure it is archived
        this.readingToArchive = userReadings.readings[1]
        // reading that we'll be setting as our readingsArchivedBefore property on the user - send PUT to server
        this.readingsArchivedBefore = userReadings.readings[0].createdAt
      } else {
        // Clear values
        delete this.readingToArchive
        delete this.readingsArchivedBefore
      }
    } catch (err) {
      console.error(err)
    }
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
    this._router.navigate(['/new-reading'], { queryParams: { copyId: this.reading._id }})
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
  public close(): void {
    if (this.initialized) {
      this.closeModal.emit()
    }
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
    let saveReading: Reading = Object.assign({}, this.reading)
    // remove _id, and other owner properties before we save
    delete saveReading._id
    delete saveReading.owner_id
    delete saveReading['owner']
    delete saveReading['words_preview']
    try {
      let savedReading: Reading
      savedReading = await this._readings.save(this.reading).toPromise()
      this.createdReadingSuccess()
      this.showFirstGroupModal = true
    } catch (err) {
      console.error(err)
    }
  }

  private createdReadingSuccess(): void {
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action: `existingReading_${(this.reading.public ? 'public' : 'private')}_create`,
      properties: {
        category: this._auth.setAnalyticEventCategory(),
        label: this._auth.setAnalyticEventLabel(),
      },
    })
  }

  /**
   * Opens reading for first group
   * @param project Project object for first group
   */
  public finalizeShare(project: Project) {
    // Set newly created Group
    this.newGroup = project
    // Archive if needed
    if (this.readingsArchivedBefore) {
      this.archiveReading()
      this.shareReading()
    } else {
      this.shareReading()
    }
  }

  public shareReading(): void {
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
    this._router.navigate(['project', this.newGroup._id], { queryParams: { readingCodeModal: true } })
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
}
