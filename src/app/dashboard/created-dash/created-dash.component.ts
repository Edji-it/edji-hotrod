import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService, ProjectService, ReadingQuery, AnalyticsService } from '../../_services'
import { User, Reading } from '../../shared/datatypes'
import { take, first } from 'rxjs/operators'

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
  public errorObject: { serverError?: boolean } = {}
  public readingToBeRemoved: Reading

  public showLoginReqModal: boolean = false
  public showNewReadingVideoModal: boolean = false
  public user: User
  // Filter values
  public activeFilter: string = 'recent'
  public activeFilterValue: string = ''
  // Joined Readings, pagination values
  public loading: boolean = true
  public rows: number = 15 // number of Readings to return
  public total: number = 15 // total Readings
  public pageNo: number = 1
  public paginationDisabled: boolean = false
  public guideLinks: { displayName: string; url: string }[] = [
    { displayName: 'Lesson Ideas', url: 'http://guide.edji.it/index.php/2017/05/20/getting-started-with-edji/' },
    { displayName: 'Readings for Math', url: 'http://guide.edji.it/index.php/2017/07/16/using-edji-with-math/' },
    { displayName: 'Video Tutorials', url: 'https://www.youtube.com/channel/UCxkb7DqTXF4EQWHLB7Bex5g/videos' },
  ]
  public filterCount: number = 0
  private subscriptions: Subscription[] = []

  // Main display toggle
  public isSearching: boolean

  // Search
  public searchFieldWidth: number = 100
  public lastSearchTerm: string = ''
  public searchParams: ReadingQuery = {
    first: 0,
    searchTerm: '',
    createdCollection: 'recent',
  }

  // Search alerts
  public searchAlerts: {
    serverError?: boolean
    noResults?: boolean
    notFollowing?: boolean
  } = {}

  // Choose Your Reading onboarding data
  public cohortOptions: CohortValue[] = [
    { label: 'Elementary/Primary', grades: [0, 1, 2, 3, 4] },
    { label: 'Middle/Junior High', grades: [5, 6, 7, 8] },
    { label: 'High/Secondary', grades: [9, 10, 11, 12] },
    { label: 'College/University', grades: [13] },
    { label: 'Professional Development', grades: [21] },
  ]

  public cohortChoice: CohortValue
  public templateChoices: any[]

  private templates: { title: string; cohort: number; _id: string; note: string }[] = []

  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _analytics: AnalyticsService,
  ) {}

  ngOnInit() {
    // datalist component intializes by calling loadRecentlyCreated()
    this.loading = true
    // Set onboarding templates
    let isDev = this._auth.getEnv() === 'dev'
    this.templates = [
      {
        title: ':alembic: Scientific Method with Marie Curie',
        cohort: 5,
        _id: isDev ? '5db1c419dafbb218db2a369e' : '5db47f10ba6d9c002165059e',
        note: 'Concept introduction, Middle to Junior High level',
      },
      {
        title: ':baseball: Casey at the Bat by E.L. Thayer',
        cohort: 9,
        _id: isDev ? '5db1c741dafbb218db2a370b' : '5db480b3590bdf00219b9275',
        note: 'Poetry analysis, High School level',
      },
      {
        title: ':candy: Favorite Movie Candy By State',
        cohort: 2,
        _id: isDev ? '5db1d5fbdafbb218db2a38bc' : '5db481ca590bdf00219b927c',
        note: 'Fun map exploration, Elementary level',
      },
      {
        title: ':school: An Edji Introduction (PD)',
        cohort: 21,
        _id: isDev ? '5db1da04dafbb218db2a3945' : '5db48578ba6d9c0021650750',
        note: 'Starter lesson for training other teachers',
      },
    ]

    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
      }),
      this._readings.currentUserReadings.subscribe(
        data => {
          if (data.filter) {
            this.searchParams.createdCollection = data.filter
          }
          if (this.isSearching && !this.user.hero_status) {
            this.paginationDisabled = true
            this.readings = []
          } else {
            this.paginationDisabled = false
            this.readings = data.readings || []
          }
          this.total = data.total
          this.errorObject = {}
          this.loading = false
        },
        error => {
          this.loading = false
          this.errorObject.serverError = true
          console.error(error)
        },
      ),
      // Get search params from URL
      this.route.queryParams.subscribe(params => {
        this.clearFilterVars()
        if (params.q) {
          this.searchParams.searchTerm = params.q
          this.isSearching = true
        } else {
          this.isSearching = false
        }
        if (params.from) {
          this.searchParams.first = parseInt(params.from)
        }
        if (params.createdCollection) {
          this.searchParams.createdCollection = params.createdCollection
          if (params.createdCollection != 'recent') {
            this.filterCount++
          }
        }
        this.loadSearch()
      }),
    )
    // Load user's drafts
    this.loadDrafts()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
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
    this._readings
      .delete(draft)
      .pipe(take(1))
      .subscribe(
        data => {
          // Remove draft from list
          this.drafts = this.drafts.filter(existingDraft => {
            return existingDraft._id != draft._id
          })
        },
        err => {
          console.log('Unable to delete draft')
        },
      )
  }

  /**
   * Primary trigger for updating search
   * - Passes new params to URL
   * @action is the filter that is changing (used for analytics)
   * @param paging Pagination values should only be passed for a pagination event (from the datalist component)
   * @duplicated with search-page.component.ts
   */
  updateSearchParams(action: string, paging?: any, searchDiscover?: boolean) {
    // Ignore if pagination values are passed and unchanged
    if (paging && this.searchParams.first == paging.first && this.rows == paging.rows) {
      return
    }
    let filters = {}
    let filterParams = {}
    // Pagination values
    this.searchParams.first = filters['from'] =
      paging && paging.first != undefined ? parseInt(paging.first) : this.searchParams.first
    if (this.searchParams.first < 0) {
      this.searchParams.first = filters['from'] = 0
    }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows
    this.pageNo = Math.floor((this.searchParams.first + 1) / this.rows) + 1
    if (this.searchParams.searchTerm) {
      this.isSearching = true
      filterParams['q'] = this.searchParams.searchTerm
    }
    if (this.searchParams.first) {
      filterParams['from'] = this.searchParams.first
    }
    if (this.searchParams.createdCollection !== 'versions') {
      filterParams['createdCollection'] = this.searchParams.createdCollection
    }
    // fire an analytic event here for tracking purposes
    if (action !== '') {
      this.angulartics.eventTrack.next({
        action: 'createdDash_' + action,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    if (searchDiscover) {
      this.router.navigate(['/discover/search'], {
        queryParams: { q: this.searchParams.searchTerm ? this.searchParams.searchTerm : '' },
      })
    } else {
      this.router.navigate(['/dashboard/create' + (this.isSearching ? '/search' : '')], { queryParams: filterParams })
    }
  }

  /**
   * Clear component variables handling applied filters
   */
  clearFilterVars(preserveTerm?: boolean) {
    if (!preserveTerm) {
      this.searchParams.searchTerm = ''
    }
    this.filterCount = 0
    this.searchParams.first = 0
  }

  /**
   * Load Feed with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   * @note ONLY triggered by params subscription
   */
  loadSearch() {
    this.loading = true
    // Reset results
    this.readings = []
    this.searchAlerts = {}

    // pass in the arguments to build the queryParam string
    this.searchParams.scope = 'owner'
    this.searchParams.pop = 'projects'
    // note search term for display with results
    this.lastSearchTerm = this.searchParams.searchTerm

    let queryString = this._readings.buildSearchParams(this.searchParams)

    this._readings.search(queryString, this.user).subscribe(
      data => {
        this.loading = false
        // Handle no results messaging
        if (this.searchParams.searchTerm && this.readings.length < 1) {
          this.searchAlerts.noResults = true
        }
      },
      err => {
        this.loading = false
        this.searchAlerts.serverError = true
        console.error(err)
      },
    )
  }

  public showTemplates(cohort: CohortValue, index: number): void {
    this.cohortChoice = cohort
    // Save to user preferences
    this._auth
      .updateUser({ prefs: { teachingGrades: cohort.grades } })
      .pipe(first())
      .subscribe()
    // Pause to let user see their selection
    setTimeout(() => {
      // Filter templates
      this.templateChoices = this.templates.filter(template => {
        return template.cohort === index
      })
    }, 300)
  }
}

interface CohortValue {
  label: string
  grades: number[]
}
