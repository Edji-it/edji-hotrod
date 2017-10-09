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

  constructor(private _readings: ReadingService) { }

  ngOnInit() {
    this._readings.getFeed()
      .subscribe(feed => {
        this.readings = feed
      })
  }

 
}