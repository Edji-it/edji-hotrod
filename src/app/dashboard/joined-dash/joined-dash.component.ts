import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from '../../_services'
import { ProjectStore } from 'src/app/_store';
import { ProjectListStore } from 'src/app/_store/project-list.store';

@Component({
  selector: 'edji-joined-dash',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./joined-dash.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './joined-dash.component.pug',
})
export class JoinedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  public projects: Array<any> = []
  public errorObject = {
    wrongCode: '',
    projectError: '',
  }
  private subscriptions: Subscription[] = []
  public codeForm: FormGroup
  public joinLoading: boolean = false
  public activeFilter: string = 'recent'
  // Joined Readings, p-datalist values
  public loading: boolean = true
  public first: number = 0 // first page
  public rows: number = 25 // number of Readings to return
  public total: number = 25 // total Readings
  private currentPageNo: number = 0 // used for analytics to determine page up/down direction

  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService,
    private projectStore: ProjectStore,
    private projectListStore: ProjectListStore,
    private angulartics: Angulartics2,
    fb: FormBuilder,
  ) {
    this.codeForm = fb.group({
      projectCode: [null, [Validators.required]],
    })
  }

  ngOnInit() {
    // Initialize list of Joined Projects
    this.loadJoinedFeed()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Load Created with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadJoinedFeed(paging?: any) {
    window.scrollTo(0, 0)
    this.projects = []
    let filters = {}
    this.loading = true

    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? parseInt(paging.first) - 1 : this.first
    if (this.first < 0) {
      this.first = filters['start'] = 0
    }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    if (paging && paging !== undefined) {
      let direction = 'Up'
      if (this.currentPageNo > paging.page) {
        direction = 'Down'
      }
      // fire an analytic event here for tracking purposes
      this.angulartics.eventTrack.next({
        action: 'joinedReading_pagination_page' + direction,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
      this.currentPageNo = paging.page
    }

    this.projectListStore.listJoined(filters).subscribe(
      data => {
        this.loading = false
        this.total = data.total
        this.projects = data.projects || []
      },
      error => {
        this.loading = false
        console.error(error)
        this.errorObject.projectError = 'We had some trouble getting your projects, it might be our fault'
      },
    )
  }

  /**
   * Load filter
   * @param filter string key value for filter being applied (recent)
   */
  public loadFilter(filter: string): void {
    this.activeFilter = filter

    // Handle each sort option
    if (filter === 'recent') {
      this.loadJoinedFeed()
    }
  }

  /**
   * Navigate to the session
   * @param formValue
   */
  public addSession(formValue: any): void {
    this.joinLoading = true

    this.projectStore.setCurrentProject(formValue.projectCode).subscribe(
      project => {
        this.joinLoading = false
        this.router.navigate(['/project', project._id])
      },
      error => {
        this.joinLoading = false
        this.errorObject.wrongCode = 'Unfortunately, we did not find that project'
      },
    )
  }
}
