import { Subscription } from 'rxjs/Rx';
import { Angulartics2 } from 'angulartics2';
import { ReadingService, ProjectService } from '../../../shared';
import { Reading, Project }      from '../../../shared/datatypes';
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'hot-reading-card',
  templateUrl: 'reading-card.component.pug',
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
  @Input() readOnly: boolean;

  private showOptions     : boolean = false;
  private showOptionsV    : boolean = false;
  private showVersions    : boolean = false;
  private relevantReading : any = {};
  private relevantProject : Project;
  private showAddModal    : boolean = false;
  private showDeleteReadingModal : boolean = false;
  private showDeleteProjectModal : boolean = false;
  private togglePublicFlag: boolean = false

  private versionHeight = 50;

  constructor(
    private _readings: ReadingService,
    private _projects: ProjectService,
    private angulartics: Angulartics2
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      // Sometimes versions are updated, but the component maintains the version array, so we need to listen for updates
      this._readings.refreshVersions.subscribe(
        projectId => {
          this.versions.forEach( readingVersion => {
            readingVersion.projects && readingVersion.projects.forEach(
              versionProject => {
                if (versionProject._id == projectId) {
                  // If the targeted Project is here, let's refresh our versions
                  this.versions = []
                  this.getVersions(this.reading.version_id)
                }
              }
            )
          })
        }
      )
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  } //ngOnDestroy

  getVersions(versionId : string) {
    if (this.showVersions && this.versions.length < 1) {
      this.isLoading = true;
      this.angulartics.eventTrack.next({ action: "getAllVersions", properties: { category: "serviceCalls", label: "attempt" }});

      this._readings.getAllVersions(versionId)
        .subscribe(
          data => {
            this.angulartics.eventTrack.next({ action: "getAllVersions", properties: { category: "serviceCalls", label: "success" }});
            this.isLoading = false;
            this.versions = data.readings || [];
          },
          err => {
            this.isLoading = false;
            this.angulartics.eventTrack.next({ action: "getAllVersions", properties: { category: "serviceCalls", label: "failure" }});
            this.errorObject.readingError = "We had some trouble getting the versions for this reading, it might be our fault";
          })
    } // if
  } // getVersions(versionId : string)

  hasProjects() : boolean {
    if (!this.reading.projects || !this.reading.projects[0]) {
      return false
    } else {
      return true
    }
  }

  versionsHeight() : number {
    if (document.getElementById(this.reading._id) && document.getElementById(this.reading._id).clientHeight > 66 && !this.isLoading && this.versionHeight == 50) {
      this.versionHeight = document.getElementById(this.reading._id).clientHeight;
    } 
    return this.versionHeight;
    
  } // versionsHeight() : number

  togglePublic(makePublic: boolean): void {
    console.log(this.reading)
    if (makePublic && (!this.reading.grade_levels || !this.reading.subjects)) {
      console.log('cannot flip to public without further info')
    }
  }

} // @Component