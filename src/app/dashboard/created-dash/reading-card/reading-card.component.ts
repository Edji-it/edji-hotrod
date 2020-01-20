import { Subscription } from 'rxjs'
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

// Project Dependencies
import {
  ReadingService,
  AnalyticsService,
  AuthService,
  AcademyState,
  Academy,
  SecretSwitchesService,
} from '../../../_services'
import { Reading, Project, User, ReadingType } from '../../../shared/datatypes'
import { take } from 'rxjs/operators'
import { ALLSPARK } from 'src/app/app.constants'

@Component({
  selector: 'hot-reading-card',
  templateUrl: './reading-card.component.pug',
  styleUrls: ['./reading-card.component.scss'],
})
export class ReadingCardComponent implements OnInit, OnDestroy {
  public versions: any[] = []
  public errorObject = {
    readingError: '',
  }
  private subscriptions: Subscription[] = []
  public isLoading: boolean = false

  // Secret switch for academy reading type
  public academyReadingType: boolean

  @Input()
  public reading: Reading
  @Input()
  public readOnly: boolean

  public showOptions: boolean = false
  public showOptionsV: boolean = false
  public showVersions: boolean = false
  public relevantReading: any = {}
  public relevantProject: Project
  public showAddModal: boolean = false
  public showDeleteReadingModal: boolean = false
  public showReadingLinkModal: boolean = false
  public showDeleteProjectModal: boolean = false
  public toggleTypeFlag: boolean
  public currentTypeFlag: boolean
  public showReadingDiscoverModal: boolean
  public showBookmarkTooltip: boolean
  public gradeInitials: string[] = ALLSPARK.GRADEINITIALS
  public gradeDisplay: string
  public newReadingType: ReadingType
  public academyState: AcademyState = {}
  public currentAcademy: Academy = {}

  public versionHeight = 50

  private user: User

  constructor(
    private _route: ActivatedRoute,
    private _readings: ReadingService,
    private _auth: AuthService,
    private _switches: SecretSwitchesService,
    private _analytics: AnalyticsService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.user = user
      }),
      this._auth.currentAcademyState.subscribe(currentState => {
        this.academyState = currentState
        // Set abbreviation
        if (this.academyState && this.academyState.academies) {
          this.currentAcademy = this.academyState.academies[this.academyState.selected]
        } else {
          this.currentAcademy = {}
        }
      }),
      this._switches.secretSwitchesUpdates.subscribe(switches => {
        if (switches['academyReading']) {
          this.academyReadingType = switches['academyReading']
        }
      }),
    )
    if (this.reading.grade_levels) {
      let grades = this.reading.grade_levels
      // Set grade values
      let gradeStart = this.gradeInitials[grades[0]]
      let gradeEnd = this.gradeInitials[grades[grades.length - 1]]
      if (gradeStart === gradeEnd) {
        this.gradeDisplay = gradeStart
      } else {
        this.gradeDisplay = gradeStart + ' - ' + gradeEnd
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Updates user's current readings with all versions of a specific reading
   * @param versionId "version_id" property from the appropriate Reading
   */
  getVersions(versionId: string) {
    this.isLoading = true
    this._analytics.event(`createdReading_getAllVersions`)
    // Update current user readings on Dashboard
    this._readings.getAllVersions(versionId)
  }

  hasProjects(): boolean {
    if (!this.reading.projects || !this.reading.projects[0]) {
      return false
    } else {
      return true
    }
  }

  versionsHeight(): number {
    if (
      document.getElementById(this.reading._id) &&
      document.getElementById(this.reading._id).clientHeight > 66 &&
      !this.isLoading &&
      this.versionHeight == 50
    ) {
      this.versionHeight = document.getElementById(this.reading._id).clientHeight
    }
    return this.versionHeight
  }

  public toggleReadingType(readingType: ReadingType): void {
    const currentType = this.reading.reading_type
    const publicDetailsPresent = this.publicReadingReq()

    // if user selects option that reading currently is then close toggle
    if (currentType === readingType) {
      this.toggleTypeTooltip(true)
      return
    }

    // if we don't need further detail and are ready to make the change, then make it
    if ((readingType !== 'private' && this.publicReadingReq()) || readingType == 'private') {
      this._analytics.event(`createdReading_togglePublic_${readingType}`)
      this.toggleTypeTooltip(true)

      // cache the reading since the server will return a reading stripped of projects, and we only want to update the public flag on return
      let updateReading = this.reading
      updateReading.reading_type = readingType
      this._readings.save(updateReading).subscribe(
        data => {
          if (data._id) {
            this.reading.reading_type = data.reading_type
            this.toggleTypeTooltip(true)
          }
        },
        error => {
          console.error(error)
        },
      )
    } else {
      // Close the tooltip and toggle the grade_levels and subjects add modal
      this.newReadingType = readingType
      this.toggleTypeTooltip(true)
      this.showReadingDiscoverModal = true
      return
    }
  }

  // determine if non-private readings are ready to share
  private publicReadingReq(): boolean {
    return (
      this.reading.grade_levels &&
      this.reading.grade_levels.length > 0 &&
      (this.reading.subjects && this.reading.subjects.length > 0)
    )
  }

  // toggles the change reading_type tooltip
  private toggleTypeTooltip(forceClose: boolean) {
    if (forceClose) {
      this.toggleTypeFlag = false
      return
    }
    if (this._route.snapshot.routeConfig.path != 'discover') {
      this.toggleTypeFlag = !this.toggleTypeFlag
    }
  }

  /**
   * Add group to reading card
   * @param group Project object to add to reading
   */
  public addGroup(readingVersion: Reading, group) {
    if (!readingVersion.projects) {
      readingVersion.projects = []
    }
    readingVersion.projects.push(group)
    this.showAddModal = false
  }

  /**
   * Toggles bookmarking of a reading
   * @param reading
   */
  public toggleBookmark(reading: Reading): void {
    // Set "bookmarked" value
    if (!!reading.owner_bookmarked) {
      reading.owner_bookmarked = false
    } else {
      reading.owner_bookmarked = true
    }
    // Save bookmark to reading
    this._readings
      .save(reading)
      .pipe(take(1))
      .subscribe(
        () => {
          // Bookmarking successful
        },
        err => {
          // Display error to user
          console.error(err)
        },
      )
  }
}
