import { Subscription } from 'rxjs/Rx';
import { Angulartics2 } from 'angulartics2/dist';
import { ReadingService, ProjectService } from '../../../shared';
import { Reading, Project }      from '../../../shared/datatypes';
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';

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

  @Input() reading: Reading;

  @Output() 
  renewReadings : EventEmitter<string> = new EventEmitter<string>();
  @Output()
  refreshReadings : EventEmitter<any> = new EventEmitter(); // Pass up to created-dash.component

  private showOptions     : boolean = false;
  private showOptionsV    : boolean = false;
  private showVersions    : boolean = false;
  private relevantReading : any = {};
  private relevantProject : Project;
  private showAddModal    : boolean = false;
  private showDeleteReadingModal : boolean = false;
  private showDeleteProjectModal : boolean = false;

  private versionHeight = 50;

  constructor(
    private _readings: ReadingService,
    private _projects: ProjectService,
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

  // Calls up to created-dash to get this reading card removed
  public removeThisReading () : void {
    this.renewReadings.emit(this.reading._id);
  }

  // Call up to created-dash to refresh all readings. Like after we remove a project.
  public refreshAllReadings () : void {
    this.refreshReadings.emit();
  }

  versionsHeight() : number {
    if (document.getElementById(this.reading._id) && document.getElementById(this.reading._id).clientHeight > 66 && !this.isLoading && this.versionHeight == 50) {
      this.versionHeight = document.getElementById(this.reading._id).clientHeight;
    } 
    return this.versionHeight;
    
  } // versionsHeight() : number

} // @Component