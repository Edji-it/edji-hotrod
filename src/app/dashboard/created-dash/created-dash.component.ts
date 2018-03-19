import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { Angulartics2 } from 'angulartics2'
import { Reading }      from '../../shared/datatypes';

import { AuthService, ReadingService, ProjectService } from '../../shared'
import { User } from '../../shared/datatypes'

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edji-created-dash',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './created-dash.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './created-dash.component.pug'
})
export class CreatedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private readings: Reading[] = [];
  private errorObject = {
    readingError: ""
  };
  private subscriptions: Subscription[] = [];

  private showLoginReqModal: boolean = false
  private user: User

  private readingToBeRemoved : Reading;

  // Joined Readings, p-datalist values
  private loading: boolean = true
  private first: number = 0 // first page 
  private rows: number = 15 // number of Readings to return
  private total: number = 15 // total Readings

  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService, 
    private _readings: ReadingService,
    private _projects: ProjectService,
    private angulartics: Angulartics2
  ) {
  }

  ngOnInit() {
    // datalist component intializes by calling loadCreatedFeed()
    this.loading = true;

    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
        this.user = user
      })
    )
  } //  ngOnInit()

  ngOnDestroy () {}

  /**
   * Load Created with Params
   * - This auto-runs on load and every change, called by p-dataList in the template
   */
  loadCreatedFeed(paging?: any): void{
    let filters = {}
    this.loading = true

    // Pagination values
    this.first = filters['start'] = paging && paging.first != undefined ? (parseInt(paging.first) - 1) : this.first
    if (this.first < 0) { this.first = filters['start'] = 0 }
    this.rows = filters['size'] = paging && paging.rows != undefined ? parseInt(paging.rows) : this.rows

    this._readings.getCreated(filters).subscribe(
      (data)  => {
          this.loading = false;
          this.readings = data.readings || [];
          this.total = data.total;
        },
        (error) => {
          this.loading = false;
          this.angulartics.eventTrack.next({ action: "getAllReadings", properties: { category: "serviceCalls", label: "failure" }});
          this.errorObject.readingError = "We had some trouble getting your readings, it might be our fault";
        }
    )
  }

  private updateProjectLabel(projectId: string, projectLabel: string) {
    this._projects.update({ 'label' : projectLabel }, projectId)
      .subscribe( project => {
        console.log('Project label saved!');
      }, error => {
        console.log(error);
      });
  }
}
