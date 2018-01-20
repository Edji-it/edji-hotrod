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
  private rows: number = 3

  constructor(private _readings: ReadingService) { }

  ngOnInit() {
    this._readings.getFeed()
      .subscribe(readings => {
        this.readings = readings
      })
  }

  loadFeed(paging: any){
    console.log("Load feed!", event)

    let filters = {
      type: this.followingFilter ? "following" : "global"
    }
    // Pagination values
    filters['start'] = paging.first ? paging.first : this.first
    filters['size'] = paging.rows ? paging.rows : this.first
    
    if (this.gradeFilter.length > 0) {
      filters['grades'] = this.gradeFilter
    }

    this._readings.getFeed(filters)
      .subscribe(readings => {
        this.readings = readings
      })
  }

 
}