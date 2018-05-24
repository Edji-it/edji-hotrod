import { Subscription } from 'rxjs';
import { Angulartics2 } from 'angulartics2';
import { ReadingService, ProjectService } from '../../../shared';
import { Reading, Project }      from '../../../shared/datatypes';
import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hot-reading-card',
  templateUrl: './reading-card.component.pug',
  styleUrls: ['./reading-card.component.scss']
})
export class ReadingCardComponent implements OnInit, OnDestroy {
  public versions: any[] = [];
  public errorObject = {
    readingError: ""
  };
  private subscriptions: Subscription[] = [];
  public isLoading: boolean = false;

  @Input() 
  public reading: Reading;
  @Input() 
  public readOnly: boolean;

  public showOptions     : boolean = false;
  public showOptionsV    : boolean = false;
  public showVersions    : boolean = false;
  public relevantReading : any = {};
  public relevantProject : Project;
  public showAddModal    : boolean = false;
  public showDeleteReadingModal : boolean = false;
  public showDeleteProjectModal : boolean = false;
  public togglePublicFlag: boolean
  public currentPublicFlag: boolean
  public showReadingDiscoverModal: boolean

  public versionHeight = 50;

  constructor(
    private _route: ActivatedRoute,
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

  togglePublic(publicFlag: boolean): void {
    // Get the current public flag value from the reading; if none, assume false
    this.currentPublicFlag = false
    if (this.reading.public) {
      this.currentPublicFlag = true
    }
    // If the user picks the value of public flag that it already is, close the tooltip
    if (this.currentPublicFlag==publicFlag) {
      this.togglePublicFlag=false
      return
    }
    // If user wishes to make a private reading public, make sure grade_levels and subjects exist on the reading
    if (publicFlag && (!this.reading.grade_levels || !(this.reading.grade_levels.length>0) || !this.reading.subjects || !(this.reading.subjects.length>0))) {
      // Close the tooltip and toggle the grade_levels and subjects add modal
      this.togglePublicFlag=false
      this.showReadingDiscoverModal=true
      return
    }

    if ((publicFlag && (this.reading.grade_levels && this.reading.subjects)) || !publicFlag) {
      // Close the tooltip
      this.togglePublicFlag=false

      // cache the reading since the server will return a reading stripped of projects, and we only want to update the public flag on return
      let updateReading = this.reading
      updateReading.public = publicFlag
      //  Make the call to PUT the reading public value
      this._readings.save(updateReading)
        .subscribe(
          data => {
            if (data._id) {
              this.reading.public = data.public
            }
          },
          error => {
            console.error(error)
          }
        )
    }
  }

  private togglePublicTooltip() {
    if(this._route.snapshot.routeConfig.path!='discover') {
      this.togglePublicFlag=!this.togglePublicFlag
    }
  }

} // @Component