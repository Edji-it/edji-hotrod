import { Subscription } from 'rxjs/Rx';
import { Angulartics2 } from 'angulartics2/dist';
import { ReadingService } from '../../../shared';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'hot-reading-card',
  templateUrl: 'reading-card.component.html',
  styleUrls: ['./reading-card.component.scss']
})
export class ReadingCardComponent implements OnInit, OnDestroy {
  private versions: any[] = [];
  private errorObject = {
    readingError: ""
  };
  private subscriptions: Subscription[] = [];
  private isLoading: boolean = false;

  @Input() reading: any;

  private showOptions: boolean = false;
  private showOptionsV: boolean = false;
  private showVersions: boolean = false;
  private showAddModal: boolean = false;

  constructor(
    private _readings: ReadingService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  getVersions(versionId : string) {
    if (this.showVersions) {
      this.isLoading = true;

      this._readings.getAllVersions(versionId)
        .subscribe(
          data => {
            console.log(data);
            // console.log(data.readings);
            this.isLoading = false;
            this.versions = data.readings || [];
          },
          err => {
            this.isLoading = false;
            // this.angulartics.eventTrack.next({ action: "getAllVersions", properties: { category: "serviceCalls", label: "failure" }});
            this.errorObject.readingError = "We had some trouble getting the versions for this reading, it might be our fault";
          })
    }
  }

}