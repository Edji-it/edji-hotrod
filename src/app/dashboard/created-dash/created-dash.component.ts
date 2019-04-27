import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService, ProjectService } from '../../_services'
import { User, Reading } from '../../shared/datatypes'
import { take } from 'rxjs/operators'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edji-created-dash', // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./created-dash.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './created-dash.component.pug',
})
export class CreatedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  public readings: Reading[] = []
  public drafts: Reading[] = []
  public errorObject: { readingError?: string } = {}
  public readingToBeRemoved: Reading

  public showLoginReqModal: boolean = false
  public showNewReadingVideoModal: boolean = false
  public user: User
  // Filter values
  public activeFilter: string = 'recent'
  public activeFilterValue: string = ''
  // Joined Readings, p-datalist values
  public loading: boolean = true
  public first: number = 0 // first page
  public rows: number = 15 // number of Readings to return
  public total: number = 15 // total Readings
  public pageNo: number = 1
  public guideLinks: { displayName: string; url: string }[] = [
    { displayName: 'Lesson Ideas', url: 'http://guide.edji.it/index.php/2017/05/20/getting-started-with-edji/' },
    { displayName: 'Readings for Math', url: 'http://guide.edji.it/index.php/2017/07/16/using-edji-with-math/' },
    { displayName: 'AVID and WICOR', url: 'http://guide.edji.it/index.php/2018/09/20/using-edji-with-avid-wicor/' },
  ]

  private currentPageNo: number = 0 // used for analytics to determine page up/down direction
  private subscriptions: Subscription[] = []

  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _readings: ReadingService,
    private _projects: ProjectService,
    private angulartics: Angulartics2,
  ) { }

  ngOnInit() {
    // datalist component intializes by calling loadRecentlyCreated()
    this.loading = true

    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      this._readings.currentUserReadings.subscribe(
        data => {
          // console.log('updating created readings!')
          this.readings = data.readings || []
          this.total = data.total
          this.pageNo = Math.floor((this.first + 1) / this.rows) + 1
          // Set display filter
          if (data.filter) {
            this.activeFilter = data.filter
            this.activeFilterValue = data.filterValue
          }
          // Clear errors
          this.errorObject = {}
          this.loading = false
        },
        error => {
          this.loading = false
          this.errorObject.readingError =
            '<b>Error Loading Readings</b> There was an error loading your readings. Please try again later or <a href="mailto:support@edji.it" target="_blank" class="link">contact support</a>.'
          console.error(error)
        },
      ),
    )

    // Load user's created readings
    this.loadRecentlyCreated()
    // Load user's drafts
    this.loadDrafts()
  } //  ngOnInit()

  ngOnDestroy() { }

  /**
   * Load Created with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadRecentlyCreated(paging?: any): void {
    window.scrollTo(0, 0)
    this.readings = []
    let filters = {}
    this.loading = true

    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? parseInt(paging.first) - 1 : this.first
    if (this.first < 0) {
      this.first = filters['start'] = 0
    }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    this._readings.updateCreated(this.user, filters)
    if (paging && paging !== undefined) {
      let direction = 'Up'
      if (this.currentPageNo > paging.page) {
        direction = 'Down'
      }
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'createdReading_pagination_page' + direction,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
      this.currentPageNo = paging.page
    }
  }

  /**
   * Load Owner Bookmarked
   * - Note: Does not support pagination
   * - Updates currentUserReadings
   * - Not available to Free users
   */
  private loadOwnerBookmarked(): void {
    this.loading = true

    // Tell reading service to fetch bookmarked and update currentUserReadings
    this._readings.getOwnerBookmarked()
  }

  /**
   * Loads draft array for current user
   * - Note: Does not support pagination
   */
  private loadDrafts(): void {
    this._readings
      .getDrafts()
      .pipe(take(1))
      .subscribe(
        data => {
          if (data.readings) {
            this.drafts = data.readings
          }
        },
        error => {
          console.error(error)
        },
    )
  }

  /**
   * Delete a draft
   * @param draftId
   */
  public deleteDraft(draft: Reading): void {
    this._readings.delete(draft)
      .pipe(take(1))
      .subscribe(data => {
        // Remove draft from list
        this.drafts = this.drafts.filter((existingDraft) => {
          return existingDraft._id != draft._id
        })
      }, err => {
        console.log("Unable to delete draft")
      })
  }

  /**
   * Load filter
   * @param filter string key value for filter being applied (recent, bookmarket)
   */
  public loadFilter(filter: string): void {
    this.activeFilter = filter

    // Handle each sort option
    if (filter === 'recent') {
      this.loadRecentlyCreated()
    } else if (filter === 'bookmarked') {
      this.loadOwnerBookmarked()
    }
  }

  private updateProjectLabel(projectId: string, projectLabel: string) {
    this._projects.update({ label: projectLabel }, projectId).subscribe(
      project => {
        console.log('Project label saved!')
      },
      error => {
        console.log(error)
      },
    )
  }
}
