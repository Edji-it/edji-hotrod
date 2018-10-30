import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService, ReadingService } from '../_services'

@Component({
  selector: 'app-discover-feed',
  templateUrl: './discover-feed.component.pug',
  styleUrls: ['./discover-feed.component.scss']
})
export class DiscoverFeedComponent implements OnInit {

  private subscriptions: Subscription[] = []
  
  public readings = []
  public edjiOwnerObj: any = {
    _id: '5897f6314897db0011a48bb8',
    fullname: 'Edji',
    username: 'edji'
  }

  // Filters
  public followingFilter: boolean = true
  public gradeFilter: number[] = []

  public first: number = 0
  public rows: number = 20
  public total: number = 20

  // State vars
  public loading: boolean = true

  constructor(
    private _readings: ReadingService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() {

  }

  /**
   * Load Feed with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadFeed(paging?: any){
    this.loading = true

    let filters = {
      type: this.followingFilter ? "following" : "global"
    }
    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? (parseInt(paging.first) - 1) : this.first
    if (this.first < 0) { this.first = filters['start'] = 0 }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows
    
    if (this.gradeFilter.length > 0) {
      filters['grades'] = this.gradeFilter
    }

    this._readings.getFeed(filters)
      .subscribe(data => {
        this.readings = data.readings || []
        this.loading = false
        this.total = data.total
      })
  }
}