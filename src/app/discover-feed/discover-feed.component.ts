import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { AuthService } from '../shared'
import { ReadingService } from "app/shared/reading.service";

@Component({
  selector: 'app-discover-feed',
  templateUrl: './discover-feed.component.pug',
  styleUrls: ['./discover-feed.component.scss']
})
export class DiscoverFeedComponent implements OnInit {

  private readings = []
  private subscriptions: Subscription[] = []

  // Filters
  private followingFilter: boolean = true
  private gradeFilter: number[] = []

  private first: number = 0
  private rows: number = 20
  private total: number = 21

  // State vars
  private loading: boolean = true

  constructor(private _readings: ReadingService) { }

  ngOnInit() {
    // Load feed with defaults
    this.loadFeed({})
  }

  loadFeed(paging?: any){
    this.loading = true

    let filters = {
      type: this.followingFilter ? "following" : "global"
    }
    // Pagination values
    this.first = filters['start'] = paging && paging.first ? parseInt(paging.first) : this.first
    this.rows = filters['size'] = paging && paging.rows ? parseInt(paging.rows) : this.rows
    
    if (this.gradeFilter.length > 0) {
      filters['grades'] = this.gradeFilter
    }

    this._readings.getFeed(filters)
      .subscribe(readings => {
        this.readings = readings
        this.loading = false
        // If service returns total
        
        // If service doesn't return total
        this.total = this.first + readings.length
        if (readings.length = this.rows) {
          this.total++
        }
      })
  }
 
}