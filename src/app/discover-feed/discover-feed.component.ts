import { Component, OnInit, OnDestroy } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService } from '../_services'

@Component({
  selector: 'app-discover-feed',
  templateUrl: './discover-feed.component.pug',
  styleUrls: ['./discover-feed.component.scss'],
})
export class DiscoverFeedComponent implements OnInit {
  private subscriptions: Subscription[] = []

  public readings = []
  public edjiOwnerObj: any = {
    _id: '5897f6314897db0011a48bb8',
    fullname: 'Edji',
    username: 'edji',
  }

  // Filters
  public followingFilter: boolean = false // default to Public
  public gradeFilter: number[] = []

  public first: number = 0
  public rows: number = 20
  public total: number = 20

  // State vars
  public loading: boolean = true

  constructor(
    private _auth: AuthService,
    private _readings: ReadingService,
    private _title: Title,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    this._title.setTitle('Edji | Discover')
  }

  /**
   * Load Feed with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadFeed(action: string, paging?: any) {
    // fire an analytic event here for tracking purposes
    if (action !== '') {
      this.angulartics.eventTrack.next({
        action: 'discover_' + action,
        properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
      })
    }
    this.loading = true

    let filters = {
      type: this.followingFilter ? 'following' : 'global',
    }
    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? parseInt(paging.first) - 1 : this.first
    if (this.first < 0) {
      this.first = filters['start'] = 0
    }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    if (this.gradeFilter.length > 0) {
      filters['grades'] = this.gradeFilter
    }

    this._readings.getFeed(filters).subscribe(data => {
      this.readings = data.readings || []
      this.loading = false
      this.total = data.total
    })
  }
}
