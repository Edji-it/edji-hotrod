import { Subscription } from 'rxjs/Rx';
import { Angulartics2 } from 'angulartics2/dist';
import { ReadingService } from '../../../shared';
import { Reading }      from '../../../shared/datatypes';
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

  private showOptions     : boolean = false;
  private showOptionsV    : boolean = false;
  private showVersions    : boolean = false;
  private relevantReading : any = {};
  private showAddModal    : boolean = false;
  private showDeleteModal : boolean = false;

  private versionHeight = 50;

  constructor(
    private _readings: ReadingService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  } //ngOnDestroy

  getVersions(versionId : string) {
    if (this.showVersions && this.versions.length < 1) {
      this.isLoading = true;

      this._readings.getAllVersions(versionId)
        .subscribe(
          data => {
            this.isLoading = false;
            this.versions = data.readings || [];
          },
          err => {
            this.isLoading = false;
            // this.angulartics.eventTrack.next({ action: "getAllVersions", properties: { category: "serviceCalls", label: "failure" }});
            this.errorObject.readingError = "We had some trouble getting the versions for this reading, it might be our fault";
          })
    } // if
  } // getVersions(versionId : string)

  // clicking the delete button
  deleteReading(reading : Reading) {
    // console.log("[reading-card.component.ts] deleteReading() worked!");
    this._readings.delete(reading);
  } // deleteButton(reading : any)
  
  versionsHeight() : number {
    if (document.getElementById(this.reading._id) && document.getElementById(this.reading._id).clientHeight > 66 && !this.isLoading && this.versionHeight == 50) {
      this.versionHeight = document.getElementById(this.reading._id).clientHeight;
    } 
    return this.versionHeight;
    
  } // versionsHeight() : number

} // @Component