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

  constructor(private _readings: ReadingService) { }

  ngOnInit() {
    this._readings.getFeed()
      .subscribe(readings => {
        this.readings = readings
      })
  }

  loadFeed(){
    console.log("Load feed!")
    let filters = {
      type: this.followingFilter ? "following" : "all",
      grades: this.gradeFilter
    }

    this._readings.getFeed()
      .subscribe(readings => {
        this.readings = readings
      })
  }

 
}