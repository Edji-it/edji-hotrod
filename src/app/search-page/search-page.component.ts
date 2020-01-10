import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import {
  AuthService,
  ReadingService,
  AcademyService,
  LockerService,
  ReadingQuery,
  AcademyState,
  Academy,
  SecretSwitchesService,
} from '../_services'
import { User, Reading, Project } from '../shared/datatypes'

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.pug',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPage implements OnInit {
  /**
   * TEMP: New feature flag (word highlights)
   */
  public academyReadingType: boolean

  private subscriptions: Subscription[] = []

  public readings = []
  public edjiOwnerObj: any = {
    _id: '5897f6314897db0011a48bb8',
    fullname: 'Edji',
    username: 'edji',
  }

  // User
  public user: User
  public userDistrict: string
  public userDistrictId: string
  // Main display toggle
  public isSearching: boolean
  // Filters
  public filterCount: number = 0
  public gradesSelected: number[] = []
  public searchParams: ReadingQuery = {
    first: 0, // defaulted to first page
    gradeMin: 0, // defaulted to min grade available
    gradeMax: 13, // defaulted to max grade available
    searchTerm: '', // defaulted to empty
    activeLibrary: 'public', // defaulted to public,
    district: '', // defaulted to empty
  }
  public followTeachers: User

  public rows: number = 15
  public total: number = 15

  // Modal Toggle
  public showReadingPreviewModal: boolean
  public showFirstGroupModal: boolean
  public showConfirmArchiveModal: boolean
  public selectedReading: Reading
  public createdReading: Reading
  public showLoginModal: boolean

  // Search
  public searchFieldWidth: number = 100

  // Search alerts
  public searchAlerts: {
    serverError?: boolean
    noResults?: boolean
    notFollowing?: boolean
  } = {}

  // State vars
  public loading: boolean = true
  public previewIndex: number = -1
  public academyState: AcademyState = {}
  private selectedAcademy: Academy = {}
  private selectedAcademyNum: number = -1

  // Archiving state
  public readingToArchive: Reading
  public readingsArchivedBefore: string
  public readingArchivalSet: boolean = false

  public newGroup: Project
  public loginParams: LoginParams = {
    preview: '',
  }

  // MAKE SUBJECTS COMPONENT
  public subjects: { id: string; name: string }[] = [
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
    private _auth: AuthService,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private _academy: AcademyService,
    private route: ActivatedRoute,
    private router: Router,
    private _locker: LockerService,
    private _switches: SecretSwitchesService,
  ) {}

  ngOnInit() {
    if (this.router.url.indexOf('/discover/search') >= 0 || this.searchParams.searchTerm.length > 0) {
      this.isSearching = true
    }
    this.subscriptions.push(
      // User subscription needs to be first, prereq for filters
      this._auth.getCurrentUser().subscribe(user => {
        this.user = user
        if (user && user.school && user.school.district_name && user.school.district_id) {
          this.userDistrict = user.school.district_name
          this.userDistrictId = user.school.district_id
        } else {
          this.userDistrict = ''
        }
      }),
      // Get search params from URL
      this.route.queryParams.subscribe(async params => {
        this.loginParams = {
          ...this.loginParams,
          ...params,
        }
        this.clearFilterVars()
        if (params.q) this.searchParams.searchTerm = params.q
        if (params.library) {
          this.searchParams.activeLibrary = params.library
          if (this.searchParams.activeLibrary !== 'public') {
            this.filterCount++
          }
        }
        if (params.subjects) {
          this.searchParams.subjectFilter = params.subjects.split(' ')
          this.filterCount++
        }
        if (params.grade_lte && params.grade_gte) {
          this.searchParams.gradeMin = parseInt(params.grade_gte)
          this.searchParams.gradeMax = parseInt(params.grade_lte)
          this.gradesSelected = []
          for (let i = this.searchParams.gradeMin; i <= this.searchParams.gradeMax; i++) {
            this.gradesSelected.push(i)
          }
          this.filterCount++
        }
        if (params.from) this.searchParams.first = parseInt(params.from)
        if (params.district) {
          this.searchParams.activeLibrary = 'public'
          this.searchParams.district = params.district
        }
        /**
         * Load results
         * - Not when opening/closing preview if results are already loaded
         */
        if (!(this.selectedReading || params.preview) || !this.readings[0]) {
          this.loadFeed()
        }
        // Load Reading Preview
        if (params.preview && (!this.selectedReading || this.selectedReading._id !== params.preview)) {
          try {
            // the link we generate to open the modal direct only contains a reading _id so we need to get that reading
            this.selectedReading = await this._readings.get(params.preview).toPromise()
            this.showReadingPreviewModal = true
          } catch (err) {
            console.error(err)
          }
        } else {
          // Clear selected reading (acts as flag for opening/closing preview)
          this.selectedReading = undefined
        }
      }),
      this._readings.currentUserReadings.subscribe(
        userReadings => {
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
        },
        err => {
          console.error(err)
        },
      ),
      this._auth.currentAcademyState.subscribe(currentState => {
        this.academyState = currentState
        this.selectedAcademy = currentState.academies[currentState.selected]
        // Re-load query on refresh or academy change
        if (
          this.searchParams.activeLibrary === 'academy' &&
          this.selectedAcademyNum !== currentState.selected &&
          currentState.selected > -1
        ) {
          this.loadFeed()
        }
        this.selectedAcademyNum = currentState.selected
      }),
      this._switches.secretSwitchesUpdates.subscribe(switches => {
        if (switches['academyReading']) {
          this.academyReadingType = switches['academyReading']
        }
      }),
    )
  }

  /**
   * Primary trigger for updating search
   * - Passes new params to URL
   * @param action is the filter that is changing (used for analytics)
   * @param paging Pagination values should only be passed for a pagination event (from the datalist component)
   * @duplicated with created-dash.component.ts
   */
  updateSearchParams(action: string, paging?: any) {
    // Ignore if pagination values are passed and unchanged
    if (paging && this.searchParams.first == paging.first && this.rows == paging.rows) {
      return
    }
    let filters = {}
    let filterParams = {}
    // reset our vars so we don't have mixed filtering that is unintended
    if (action !== 'filter_district') this.searchParams.district = ''
    // Pagination values
    this.searchParams.first = filters['from'] =
      paging && paging.first != undefined ? parseInt(paging.first) : this.searchParams.first
    if (this.searchParams.first < 0) {
      this.searchParams.first = filters['from'] = 0
    }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    if (this.searchParams.searchTerm) {
      this.isSearching = true
      filterParams['q'] = this.searchParams.searchTerm
    }
    if (this.searchParams.activeLibrary) {
      filterParams['library'] = this.searchParams.activeLibrary
    }
    if (this.searchParams.subjectFilter && this.searchParams.subjectFilter[0]) {
      filterParams['subjects'] = this.searchParams.subjectFilter.join(' ')
    }
    if (this.gradesSelected.length > 0) {
      let grades = this.gradesSelected
      filterParams['grade_gte'] = Math.min(...grades)
      filterParams['grade_lte'] = Math.max(...grades)
    }
    if (this.searchParams.first) {
      filterParams['from'] = this.searchParams.first
    }
    if (this.searchParams.district) {
      filterParams['district'] = this.searchParams.district
      filterParams['library'] = 'public'
    }
    // fire an analytic event here for tracking purposes
    if (action !== '') {
      this.angulartics.eventTrack.next({
        action: 'discover_' + action,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    this.router.navigate(['/discover' + (this.isSearching ? '/search' : '')], { queryParams: filterParams })
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
    this.searchParams.gradeMin = 0
    this.searchParams.gradeMax = 13
    this.gradesSelected = []
    this.searchParams.subjectFilter = []
    this.searchParams.activeLibrary = 'public'
    this.searchParams.district = ''
  }

  /**
   * Load Feed with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   * @note ONLY triggered by params subscription
   */
  loadFeed() {
    this.loading = true
    // Reset results
    this.readings = []
    this.searchAlerts = {}

    // if (this.searchParams.district.length > 0) {
    //   this.searchParams.activeLibrary = 'public'
    // }

    // pass in the arguments to build the queryParam string
    if (this.searchParams.activeLibrary === 'following') {
      this.searchParams.following = this.user.following
      if (!this.searchParams.following || this.searchParams.following.length < 1) {
        this.searchAlerts.notFollowing = true
        this.loading = false
        this.isSearching = false
        this.filterCount = 0
        return
      }
    } else if (this.searchParams.activeLibrary === 'academy') {
      this.searchParams.institutionId = this.selectedAcademy && this.selectedAcademy._id
    }

    let queryString = this._readings.buildSearchParams(this.searchParams)

    if (!this.user.isLoggedIn) {
      queryString += '&scope=public'
    }

    this._readings.search(queryString).subscribe(
      data => {
        this.readings = data.results || []
        this.loading = false
        this.total = data.total
        // Handle no results messaging
        if (
          (this.searchParams.searchTerm ||
            this.searchParams.district ||
            this.searchParams.activeLibrary == 'academy') &&
          this.readings.length < 1
        ) {
          this.searchAlerts.noResults = true
        }
        // handle bucket items (top followers, etc..)
        if (data && data.buckets) {
          if (data.buckets.owner_id && data.buckets.owner_id.length > 0) {
            let userIds = data.buckets.owner_id.map(obj => obj.key)
            this._auth.getPublicUsers(userIds).subscribe(
              userInfo => {
                // Display top teachers to follow, but make sure we're filtering out the current teacher (that'd be weird)
                this.followTeachers = userInfo.filter(teacher => teacher._id !== this.user._id)
              },
              error => {
                console.error(error)
              },
            )
          }
        }
      },
      err => {
        this.loading = false
        this.searchAlerts.serverError = true
        console.error(err)
      },
    )
  }

  /**
   * Opens the reading preview modal for the selected reading
   * @param reading is the reading we want to open the preview modal on
   */
  public openReadingPreview(reading: Reading): void {
    // Display logic triggered in route subscription
    this.router.navigate(['./'], {
      queryParams: { preview: reading._id },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    })
  }

  /**
   * Hover/focus for clickable Reading Cards
   * @param index Reading result list index
   */
  public readingCardHoverSet(index: number): void {
    this.previewIndex = index
  }

  /**
   * Verifies the user can save this reading without having to push one in to the archives
   * @param createdReading the new reading
   */
  public readingCreateFromPreviewSuccess(createdReading: Reading) {
    this.createdReading = createdReading
    // Need to dismiss the reading preview modal and then we can show the new group modal
    this.showReadingPreviewModal = false

    if (!this.user.hero_status && this.readingToArchive) {
      this.showConfirmArchiveModal = true
    } else {
      this.showFirstGroupModal = true
    }
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
      reading_id: this.createdReading._id,
      group_id: this.newGroup._id,
      subjects: this.createdReading.subjects,
      source: this.createdReading.source,
    })
    // Navigate user to newly created group for reading
    this.router.navigate(['project', this.newGroup._id], { queryParams: { readingCodeModal: true } })
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

  public closeReadingPreview(login?: boolean): void {
    this.showReadingPreviewModal = false
    if (login) {
      this.loginParams.preview = this.selectedReading._id
      this.showLoginModal = true
    } else {
      this.router.navigate(['./'], {
        queryParams: { preview: null },
        queryParamsHandling: 'merge',
        relativeTo: this.route,
      })
    }
  }

  public closeLoginModal(context?: string): void {
    this.showLoginModal = false
    if (context === 'preview') {
      this.showReadingPreviewModal = true
    }
  }

  /**
   * Sends user to their account page to view their district selection and make changes
   */
  public goToAccount(): void {
    this.router.navigate(['/account'])
  }

  /**
   * Opens the referral modal by using the query param
   */
  public showReferral(): void {
    // append showRefer param before we go
    this.loginParams['showRefer'] = true
    this.router.navigate(['/discover' + (this.isSearching ? '/search' : '')], { queryParams: this.loginParams })
  }

  /**
   * Sends user to the Academy pricing page
   */
  public goToAcademyPricing(): void {
    this.router.navigate(['/plans'], { fragment: 'academy' })
  }

  /**
   * A 3 column layout is used in the template for the following cases:
   *  - District Library when user is not in an Academy
   *  - Academy Library when there are top users to follow (active teachers list)
   */
  public threeColLayout(): boolean {
    if (
      this.searchParams.district.length > 0 &&
      this.academyState &&
      this.academyState.academies &&
      this.academyState.academies.length === 0
    ) {
      return true
    }
    if (this.searchParams.activeLibrary === 'academy') return true
    return false
  }
}

export interface LoginParams {
  preview?: string
  [prop: string]: any
}
