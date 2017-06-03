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
  templateUrl: './created-dash.component.html'
})
export class CreatedDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private readings: Reading[] = [];
  private errorObject = {
    readingError: ""
  };
  private subscriptions: Subscription[] = [];
  private isLoading: boolean = false;

  private showLoginReqModal: boolean = false
  private user: User

  private readingToBeRemoved : Reading;

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
    this.isLoading = true;

    this.subscriptions.push(
      this._auth.getCurrentUser().subscribe((user) => {
        this.user = user
      })
    )

    this._readings.getAll()

    this._readings.currentUserReadings.subscribe(
      (data)  => {
          this.isLoading = false;
          this.readings = data || [];
          if (!this.user || !this.user.prefs || !this.user.prefs.onboarding || !this.user.prefs.onboarding.createReadingFromDash || !this.user.prefs.onboarding.createReadingFromDash.firstDone) {
            console.log("adding me a reading!")
            this.readings.push(this.getTutorialReading())
          }
        },
        (error) => {
          this.isLoading = false;
          this.angulartics.eventTrack.next({ action: "getAllReadings", properties: { category: "serviceCalls", label: "failure" }});
          this.errorObject.readingError = "We had some trouble getting your readings, it might be our fault";
        }
    )
  } //  ngOnInit()

  ngOnDestroy () {}

  private updateProjectLabel(projectId: string, projectLabel: string) {
    this._projects.update({ 'label' : projectLabel }, projectId)
      .subscribe( project => {
        console.log('Project label saved!');
      }, error => {
        console.log(error);
      });
  }

  /**
   * Returns the tutorial reading which can be added to the dashboard
   * @returns an object which points to the tutorial reading
   */
  private getTutorialReading(): Reading {
    return {
      _id: "58be15b2ab0b2900111652cc",
      title: "How to Make a Reading",
      draft: true,
      projects: []
    }
  }
}
