import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService } from '../_services'
import { User } from '../shared/datatypes';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.pug',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPage implements OnInit {

  private subscriptions: Subscription[] = []

  public readings = []
  public edjiOwnerObj: any = {
    _id: '5897f6314897db0011a48bb8',
    fullname: 'Edji',
    username: 'edji'
  }

  // User
  private user: User

  // Filters
  public activeLibrary: string = 'public' // default to Public
  public gradesSelected: number[] = []
  public gradeMin: number = 0
  public gradeMax: number = 13

  public first: number = 0
  public rows: number = 20
  public total: number = 20

  // Search 
  public searchTerm: string = ''

  // State vars
  public loading: boolean = true


  // MAKE SUBJECTS COMPONENT
  public subjects: any = [
    {id:'literature',name:'Language Arts'},
    {id:'math',name:'Mathematics'},
    {id:'science',name:'Science'},
    {id:'geography',name:'Geography'},
    {id:'history',name:'History'},
    {id:'government',name:'Government'},
    {id:'health',name:'Health'},
    {id:'languages',name:'Foreign Languages'},
    {id:'art',name:'Art'},
    {id:'computer',name:'Computers/Technical'}
  ]
  //IMultiSelectSettings
  public subjectDropSettings: any  = {
      displayAllSelectedText: true,
      dynamicTitleMaxItems: 4
  }

  public subjectFilter: any = []


  constructor(
    private _auth: AuthService,
    private _readings: ReadingService,
    private angulartics: Angulartics2,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      // Get search params from URL
      this.route.params.subscribe(
        params => {
          if (params.q) {
            this.searchTerm = params.q
          }
          if (params.library) {
            this.activeLibrary = params.library
          }
          if (params.grade_lte && params.grade_gte) {
            this.gradeMin = parseInt(params.grade_gte)
            this.gradeMax = parseInt(params.grade_lte)
            this.gradesSelected = []
            for (let i = this.gradeMin; i <= this.gradeMax; i++) {
              this.gradesSelected.push(i)
            }
          }
          this.loadFeed('search_term')
        }
      ),
      this._auth.getCurrentUser().subscribe(
        user => {
          this.user = user
        }
      )
    )
  }

  /**
   * Load Feed with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadFeed(action: string, paging?: any) {
    let filterParams = {}
    
    if (this.searchTerm) {
      filterParams['q'] = this.searchTerm
    }
    if (this.activeLibrary) {
      filterParams['library'] = this.activeLibrary
    }
    if (this.gradesSelected.length > 0) {
      let grades = this.gradesSelected
      filterParams['grade_gte'] =  Math.min(...grades)
      filterParams['grade_lte'] =  Math.max(...grades)
    }

    this.router.navigate(['/discover/search', filterParams])

    // fire an analytic event here for tracking purposes
    if (action !== '') {
      this.angulartics.eventTrack.next({
        action: 'discover_' + action,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() }
      })
    }
    this.loading = true

    let filters = {
      // type: this.followingFilter ? "following" : "global"
    }
    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? (parseInt(paging.first) - 1) : this.first
    if (this.first < 0) { this.first = filters['start'] = 0 }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    // if (this.gradeFilter.length > 0) {
    //   filters['grades'] = this.gradeFilter
    // }


    // Attach search query
    let queryString = ''
    if (this.searchTerm) {
      queryString += 'q=' + this.searchTerm
    }
    if (this.subjectFilter && this.subjectFilter[0]) {
      queryString += '&subjects=' + this.subjectFilter[0]
    }

    if (this.activeLibrary === 'following') {
      // Loop through and apply following ids
      let following = this.user.following
      following.forEach(userId => {
        queryString += '&owner_id=' + userId
      })
    } else if (this.activeLibrary !== 'public') {
      // Handle academy/institution id filter
    }
    
    // grade_levels_lte, grade_levels_gte
    if (this.gradeMin && this.gradeMax) {
      queryString += '&grade_levels_gte=' + this.gradeMax
      queryString += '&grade_levels_lte=' + this.gradeMin
    }

    this._readings.search(queryString)
      .subscribe(data => {
        console.log('data', data)
        this.readings = data.results || []
        this.loading = false
        this.total = data.total
      }, err => {
        /**
         * @todo handle error
         */
        console.error(err)
      })
  }
}