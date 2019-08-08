import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

// Project Dependencies
import { ReadingService, ProjectService, AuthService } from '../../../_services'
import { Reading, Project, User } from '../../../shared/datatypes'
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
  public togglePublicFlag: boolean
  public currentPublicFlag: boolean
  public showReadingDiscoverModal: boolean
  public showBookmarkTooltip: boolean
  public gradeInitials: string[] = ALLSPARK.GRADEINITIALS
  public gradeDisplay: string

  public versionHeight = 50

  private user: User

  constructor(
    private _route: ActivatedRoute,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _auth: AuthService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this._auth.currentUser.subscribe(user => {
        this.user = user
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
  } //ngOnDestroy

  /**
   * Updates user's current readings with all versions of a specific reading
   * @param versionId "version_id" property from the appropriate Reading
   */
  getVersions(versionId: string) {
    this.isLoading = true
    this.angulartics.eventTrack.next({
      action: 'createdReading_getAllVersions',
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
    // Update current user readings on Dashboard
    this._readings.getAllVersions(versionId)
  } // getVersions(versionId : string)

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
  } // versionsHeight() : number

  togglePublic(publicFlag: boolean): void {
    // Get the current public flag value from the reading; if none, assume false
    this.currentPublicFlag = false
    if (this.reading.public) {
      this.currentPublicFlag = true
    }
    // If the user picks the value of public flag that it already is, close the tooltip
    if (this.currentPublicFlag == publicFlag) {
      this.togglePublicFlag = false
      return
    }
    // If user wishes to make a private reading public, make sure grade_levels and subjects exist on the reading
    if (
      publicFlag &&
      (!this.reading.grade_levels ||
        !(this.reading.grade_levels.length > 0) ||
        !this.reading.subjects ||
        !(this.reading.subjects.length > 0))
    ) {
      // Close the tooltip and toggle the grade_levels and subjects add modal
      this.togglePublicFlag = false
      this.showReadingDiscoverModal = true
      return
    }

    if ((publicFlag && (this.reading.grade_levels && this.reading.subjects)) || !publicFlag) {
      // fire an analytic event here for tracking purposes
      let publicVal = 'public'
      if (!publicFlag) {
        publicVal = 'private'
      }
      this.angulartics.eventTrack.next({
        action: 'createdReading_togglePublic_' + publicVal,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
      // Close the tooltip
      this.togglePublicFlag = false

      // cache the reading since the server will return a reading stripped of projects, and we only want to update the public flag on return
      let updateReading = this.reading
      updateReading.public = publicFlag
      //  Make the call to PUT the reading public value
      this._readings.save(updateReading).subscribe(
        data => {
          if (data._id) {
            this.reading.public = data.public
          }
        },
        error => {
          console.error(error)
        },
      )
    }
  }

  private togglePublicTooltip() {
    if (this._route.snapshot.routeConfig.path != 'discover') {
      this.togglePublicFlag = !this.togglePublicFlag
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
} // @Component
