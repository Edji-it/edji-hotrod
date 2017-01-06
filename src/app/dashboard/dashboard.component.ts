import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { AppState } from '../app.service';
import { AuthService } from '../shared/auth.service';
import { ReadingService } from '../shared/reading.service';
import { ProjectService } from '../shared/project.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'dashboard',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './dashboard.component.scss' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Set our default values
  private readings: any;
  private projects: Array<any> = [];
  private currentUser: any; 
  private isTeacher: Boolean = false;
  private errorObject = {
    wrongCode : ""
  };
  private subscriptions: Subscription[] = [];

  private codeForm: FormGroup;

  // TypeScript public modifiers
  constructor(
    public appState: AppState, 
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

        });
    
    this._projects.getAll()
      .then(
        (data)  => { 
          this.projects = data;
        },
        (error) => {

        });

    // sessions.getAll().success(function(response){
    //     $scope.sessions = response;
    // });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  deleteReading(reading) {

  }

  private addSession(formValue: any): void {
    console.log("adding session!");
    console.log(formValue);

    this._projects.currentProject.subscribe((project) => {
      console.log(project);
      this.router.navigate(['project', project._id]);
    });

    this._projects.setCurrentProject(formValue.projectCode);
  }


}
