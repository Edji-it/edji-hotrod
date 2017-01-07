import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AuthService, ReadingService, ProjectService } from '../../shared';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edji-teach-dash',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './teach-dash.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './teach-dash.component.html'
})
export class TeachDashComponent implements OnInit, OnDestroy {
  // Set our default values
  private readings: any;
  private currentUser: any; 
  private isTeacher: Boolean = false;
  private errorObject = {
    wrongCode : "",
    projectError: "",
    readingError: ""
  };
  private subscriptions: Subscription[] = [];

  private codeForm: FormGroup;

  // TypeScript public modifiers
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private _auth: AuthService, 
    private _readings: ReadingService,
    private _projects: ProjectService,
    fb: FormBuilder
  ) {
    this.codeForm = fb.group({
      projectCode: [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(4)])]
    });
  }

  ngOnInit() {
    this.currentUser = this._auth.getUser();
    this.isTeacher = this.currentUser.isTeacher;

    this._readings.getAll()
      .then(
        (data)  => { 
          console.log(data);
          this.readings = data;
        },
        (error) => {
          this.errorObject.readingError = "We had some trouble getting your readings, it might be our fault";
        });

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  private deleteReading(reading) {

  }
}
