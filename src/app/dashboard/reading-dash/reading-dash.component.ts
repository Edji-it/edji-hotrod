import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Angulartics2 } from 'angulartics2';

import { AuthService, ReadingService, ProjectService } from '../../shared';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edji-reading-dash',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './reading-dash.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './reading-dash.component.html'
})
export class ReadingDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private readings: any[] = [];
  private errorObject = {
    readingError: ""
  };
  private subscriptions: Subscription[] = [];
  private isLoading: boolean = false;


  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService, 
    private _readings: ReadingService,
    private angulartics: Angulartics2
  ) {
  }

  ngOnInit() {
    this.isLoading = true;

    this._readings.getAll()
      .then(
        (data)  => {
          this.isLoading = false;
          this.readings = data || [];
        },
        (error) => {
          this.isLoading = false;
          this.angulartics.eventTrack.next({ action: "getAllReadings", properties: { category: "serviceCalls", label: "failure" }});
          this.errorObject.readingError = "We had some trouble getting your readings, it might be our fault";
        });

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  private deleteReading(reading) {

  }
}
